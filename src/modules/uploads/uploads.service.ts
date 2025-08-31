import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { GenerateMultipartUploadUrlDto } from './dto/generate-multipart-upload-url.dto';
import { S3Service } from '../../providers/s3/s3.service';
import { MediaconvertService } from '../../providers/mediaconvert/mediaconvert.service';
import { CloudfrontService } from '../../providers/cloudfront/cloudfront.service';
import { generateFileKey } from '../../utils/file-key.util';

@Injectable()
export class UploadsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
    private readonly mediaconvertService: MediaconvertService,
    private readonly cloudfrontService: CloudfrontService,
  ) {}
  create(createUploadDto: CreateUploadDto) {
    return 'This action adds a new upload';
  }

  findAll() {
    return `This action returns all uploads`;
  }

  findOne(id: number) {
    return `This action returns a #${id} upload`;
  }

  update(id: number, updateUploadDto: UpdateUploadDto) {
    return `This action updates a #${id} upload`;
  }

  remove(id: number) {
    return `This action removes a #${id} upload`;
  }

  // Upload methods
  async generateUploadUrl(dto: GenerateUploadUrlDto) {
    const key = generateFileKey(this.configService, dto);
    return this.s3Service.GenerateUploadURLWithKey(key, dto.contentType);
  }

  async generateMultipartUploadUrl(dto: GenerateMultipartUploadUrlDto) {
    const key = generateFileKey(this.configService, dto);
    return this.s3Service.GenerateMultipartUploadURLWithKey(
      dto.partCount,
      key,
      dto.contentType,
    );
  }

  async listFiles(prefix?: string, maxKeys?: number) {
    return this.s3Service.ListBucketObjects(prefix, maxKeys);
  }

  // CloudFront/viewing methods
  getSignedUrl(s3Key: string, expiresIn?: number) {
    return {
      signedUrl: this.cloudfrontService.GenerateSignedUrl(s3Key, expiresIn),
    };
  }

  getVideoUrls(
    s3Key: string,
    qualities: Array<'low' | 'medium' | 'high' | 'ultra'>,
    format: 'mp4' | 'hls' | 'both',
  ) {
    if (format === 'mp4') {
      const urls = this.cloudfrontService.GenerateTranscodedVideoUrls(s3Key, qualities);
      return { mp4: urls.mp4 };
    } else if (format === 'hls') {
      const urls = this.cloudfrontService.GenerateTranscodedVideoUrls(s3Key, qualities);
      return { hls: urls.hls };
    } else {
      return this.cloudfrontService.GenerateTranscodedVideoUrls(s3Key, qualities);
    }
  }

  // Transcoding methods
  async startTranscoding(
    inputS3Key: string,
    outputFormats: Array<{
      format: 'mp4' | 'hls' | 'dash';
      quality: 'low' | 'medium' | 'high' | 'ultra';
    }>,
  ) {
    return this.mediaconvertService.CreateTranscodingJob(
      inputS3Key,
      outputFormats,
    );
  }

  async getTranscodingStatus(jobId: string) {
    return this.mediaconvertService.GetJobStatus(jobId);
  }

  async listTranscodingJobs(maxResults?: number) {
    return this.mediaconvertService.ListJobs(maxResults);
  }
}
