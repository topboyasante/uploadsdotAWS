import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';

@Injectable()
export class CloudfrontService {
  private readonly logger = new Logger(CloudfrontService.name);
  private readonly distributionDomain: string;
  private readonly keyPairId: string;
  private readonly privateKey: string;

  constructor(private readonly configService: ConfigService) {
    this.distributionDomain = this.configService.getOrThrow<string>(
      'aws.cloudfront.videoDomainName',
    );
    this.keyPairId = this.configService.getOrThrow<string>(
      'aws.cloudfront.keyPairId',
    );

    // Read private key from file path specified in config
    const privateKeyPath = this.configService.getOrThrow<string>(
      'aws.cloudfront.privateKey',
    );
    this.privateKey = readFileSync(privateKeyPath, 'utf8');
  }

  /**
   * Generates a signed CloudFront URL for accessing uploaded files
   * @param s3Key - The S3 object key
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns Signed CloudFront URL
   */
  GenerateSignedUrl(s3Key: string, expiresIn: number = 3600): string {
    const url = `https://${this.distributionDomain}/${s3Key}`;
    const expirationTime = new Date(Date.now() + expiresIn * 1000);

    const signedUrl = getSignedUrl({
      url,
      keyPairId: this.keyPairId,
      privateKey: this.privateKey,
      dateLessThan: expirationTime,
    });

    this.logger.log(`Generated signed CloudFront URL for key: ${s3Key}`);
    return signedUrl;
  }

  /**
   * Generates multiple signed URLs for different formats of the same content
   * @param s3Key - The base S3 object key (without extension)
   * @param formats - Array of format extensions to generate URLs for
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns Object with format as key and signed URL as value
   */
  GenerateMultipleSignedUrls(
    s3Key: string,
    formats: string[],
    expiresIn: number = 3600,
  ): Record<string, string> {
    const urls: Record<string, string> = {};

    for (const format of formats) {
      const fullKey = `${s3Key}.${format}`;
      urls[format] = this.GenerateSignedUrl(fullKey, expiresIn);
    }

    this.logger.log(
      `Generated ${formats.length} signed URLs for base key: ${s3Key}`,
    );
    return urls;
  }

  /**
   * Generates a signed URL for HLS streaming
   * @param s3KeyPrefix - The S3 key prefix for the HLS files (without .m3u8)
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns Signed CloudFront URL for the HLS playlist
   */
  GenerateHlsSignedUrl(s3KeyPrefix: string, expiresIn: number = 3600): string {
    const playlistKey = `${s3KeyPrefix}/index.m3u8`;
    return this.GenerateSignedUrl(playlistKey, expiresIn);
  }

  /**
   * Generates signed URLs for transcoded video formats
   * @param originalS3Key - The original uploaded video S3 key
   * @param qualities - Array of quality levels to generate URLs for
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns Object with quality-format combinations and their signed URLs
   */
  GenerateTranscodedVideoUrls(
    originalS3Key: string,
    qualities: Array<'low' | 'medium' | 'high' | 'ultra'>,
    expiresIn: number = 3600,
  ): {
    mp4: Record<string, string>;
    hls: Record<string, string>;
  } {
    const baseKey = originalS3Key.replace(/\.[^/.]+$/, ''); // Remove extension
    const mp4Urls: Record<string, string> = {};
    const hlsUrls: Record<string, string> = {};

    for (const quality of qualities) {
      // MP4 URLs
      const mp4Key = `transcoded/${baseKey}-mp4-${quality}.mp4`;
      mp4Urls[quality] = this.GenerateSignedUrl(mp4Key, expiresIn);

      // HLS URLs
      const hlsKey = `transcoded/${baseKey}-hls-${quality}`;
      hlsUrls[quality] = this.GenerateHlsSignedUrl(hlsKey, expiresIn);
    }

    this.logger.log(`Generated transcoded video URLs for: ${originalS3Key}`);
    return { mp4: mp4Urls, hls: hlsUrls };
  }
}
