import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListPartsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private readonly S3: S3Client;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    this.S3 = new S3Client({
      region: this.configService.getOrThrow<string>('aws.region'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('aws.accessKeyId'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'aws.secretAccessKey',
        ),
      },
    });
  }

  /**
   * Generates a presigned URL for uploading files to S3
   * @param fileExtension - Optional file extension to include in the generated key
   * @param contentType - Optional content type for the file
   * @returns Object containing the presigned URL and the generated key
   */
  async GenerateUploadURL(
    fileExtension?: string,
    contentType?: string,
  ): Promise<{ url: string; key: string }> {
    // Generate a unique key using UUID
    const timestamp = Date.now();
    const uniqueId = randomUUID();
    const key = fileExtension
      ? `uploads/${timestamp}-${uniqueId}.${fileExtension}`
      : `uploads/${timestamp}-${uniqueId}`;

    return this.GenerateUploadURLWithKey(key, contentType);
  }

  /**
   * Generates a presigned URL for uploading files to S3 with a custom key
   * @param key - The S3 key to use for the file
   * @param contentType - Optional content type for the file
   * @returns Object containing the presigned URL and the key
   */
  async GenerateUploadURLWithKey(
    key: string,
    contentType?: string,
  ): Promise<{ url: string; key: string }> {
    // Create the PutObject command for S3
    const command = new PutObjectCommand({
      Bucket: this.configService.getOrThrow<string>('aws.s3.videoInputBucket'),
      Key: key,
      ContentType: contentType,
    });

    // Generate the presigned URL with 1 hour expiration
    const presignedUrl = await getSignedUrl(this.S3, command, {
      expiresIn: 3600, // 1 hour
    });

    this.logger.log(`Generated presigned URL for key: ${key}`);

    return {
      url: presignedUrl,
      key,
    };
  }

  /**
   * Initiates a multipart upload and generates presigned URLs for each part
   * @param partCount - Number of parts to create presigned URLs for
   * @param fileExtension - Optional file extension to include in the generated key
   * @param contentType - Optional content type for the file
   * @returns Object containing upload ID, key, and array of presigned URLs for each part
   */
  async GenerateMultipartUploadURL(
    partCount: number,
    fileExtension?: string,
    contentType?: string,
  ): Promise<{
    uploadId: string;
    key: string;
    partUrls: { partNumber: number; url: string }[];
  }> {
    // Generate a unique key using UUID
    const timestamp = Date.now();
    const uniqueId = randomUUID();
    const key = fileExtension
      ? `uploads/${timestamp}-${uniqueId}.${fileExtension}`
      : `uploads/${timestamp}-${uniqueId}`;

    return this.GenerateMultipartUploadURLWithKey(partCount, key, contentType);
  }

  /**
   * Initiates a multipart upload and generates presigned URLs for each part with a custom key
   * @param partCount - Number of parts to create presigned URLs for
   * @param key - The S3 key to use for the file
   * @param contentType - Optional content type for the file
   * @returns Object containing upload ID, key, and array of presigned URLs for each part
   */
  async GenerateMultipartUploadURLWithKey(
    partCount: number,
    key: string,
    contentType?: string,
  ): Promise<{
    uploadId: string;
    key: string;
    partUrls: { partNumber: number; url: string }[];
  }> {
    // Create multipart upload
    const createCommand = new CreateMultipartUploadCommand({
      Bucket: this.configService.getOrThrow<string>('aws.s3.videoInputBucket'),
      Key: key,
      ContentType: contentType,
    });

    const createResponse = await this.S3.send(createCommand);
    const uploadId = createResponse.UploadId;

    if (!uploadId) {
      throw new Error('Failed to create multipart upload');
    }

    // Generate presigned URLs for each part
    const partUrls: { partNumber: number; url: string }[] = [];

    for (let i = 1; i <= partCount; i++) {
      const uploadPartCommand = new UploadPartCommand({
        Bucket: this.configService.getOrThrow<string>('aws.s3.videoInputBucket'),
        Key: key,
        PartNumber: i,
        UploadId: uploadId,
      });

      const presignedUrl = await getSignedUrl(this.S3, uploadPartCommand, {
        expiresIn: 3600, // 1 hour
      });

      partUrls.push({
        partNumber: i,
        url: presignedUrl,
      });
    }

    this.logger.log(
      `Generated multipart upload with ${partCount} parts for key: ${key}`,
    );

    return {
      uploadId,
      key,
      partUrls,
    };
  }

  /**
   * Generates a presigned URL to complete the multipart upload
   * @param key - The S3 object key
   * @param uploadId - The multipart upload ID
   * @param parts - Array of completed parts with their ETags
   * @returns Presigned URL to complete the multipart upload
   */
  async GenerateCompleteMultipartUploadURL(
    key: string,
    uploadId: string,
    parts: { PartNumber: number; ETag: string }[],
  ): Promise<string> {
    const command = new CompleteMultipartUploadCommand({
      Bucket: this.configService.getOrThrow<string>('aws.s3.videoInputBucket'),
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts,
      },
    });

    const presignedUrl = await getSignedUrl(this.S3, command, {
      expiresIn: 3600, // 1 hour
    });

    this.logger.log(`Generated complete multipart upload URL for key: ${key}`);
    return presignedUrl;
  }

  /**
   * Generates a presigned URL to abort the multipart upload
   * @param key - The S3 object key
   * @param uploadId - The multipart upload ID
   * @returns Presigned URL to abort the multipart upload
   */
  async GenerateAbortMultipartUploadURL(
    key: string,
    uploadId: string,
  ): Promise<string> {
    const command = new AbortMultipartUploadCommand({
      Bucket: this.configService.getOrThrow<string>('aws.s3.videoInputBucket'),
      Key: key,
      UploadId: uploadId,
    });

    const presignedUrl = await getSignedUrl(this.S3, command, {
      expiresIn: 3600, // 1 hour
    });

    this.logger.log(`Generated abort multipart upload URL for key: ${key}`);
    return presignedUrl;
  }

  /**
   * Lists all uploaded parts for a multipart upload
   * @param key - The S3 object key
   * @param uploadId - The multipart upload ID
   * @returns Array of uploaded parts with their details
   */
  async ListUploadedParts(
    key: string,
    uploadId: string,
  ): Promise<{ PartNumber: number; ETag: string; Size: number }[]> {
    const command = new ListPartsCommand({
      Bucket: this.configService.getOrThrow<string>('aws.s3.videoInputBucket'),
      Key: key,
      UploadId: uploadId,
    });

    const response = await this.S3.send(command);

    if (!response.Parts) {
      return [];
    }

    const parts = response.Parts.map((part) => ({
      PartNumber: part.PartNumber!,
      ETag: part.ETag!,
      Size: part.Size!,
    }));

    this.logger.log(`Found ${parts.length} uploaded parts for key: ${key}`);
    return parts;
  }

  /**
   * Lists objects in the S3 bucket
   * @param prefix - Optional prefix to filter objects (e.g., 'uploads/')
   * @param maxKeys - Maximum number of keys to return (default: 1000)
   * @returns Array of objects in the bucket
   */
  async ListBucketObjects(
    prefix?: string,
    maxKeys: number = 1000,
  ): Promise<
    {
      Key: string;
      LastModified: Date;
      ETag: string;
      Size: number;
      StorageClass?: string;
    }[]
  > {
    const command = new ListObjectsV2Command({
      Bucket: this.configService.getOrThrow<string>('aws.s3.videoInputBucket'),
      Prefix: prefix,
      MaxKeys: maxKeys,
    });

    const response = await this.S3.send(command);

    if (!response.Contents) {
      return [];
    }

    const objects = response.Contents.map((object) => ({
      Key: object.Key!,
      LastModified: object.LastModified!,
      ETag: object.ETag!,
      Size: object.Size!,
      StorageClass: object.StorageClass,
    }));

    this.logger.log(
      `Found ${objects.length} objects in bucket${prefix ? ` with prefix: ${prefix}` : ''}`,
    );
    return objects;
  }
}
