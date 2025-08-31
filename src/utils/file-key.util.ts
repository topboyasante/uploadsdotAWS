import { ConfigService } from '@nestjs/config';
import { GenerateUploadUrlDto } from '../modules/uploads/dto/generate-upload-url.dto';
import { GenerateMultipartUploadUrlDto } from '../modules/uploads/dto/generate-multipart-upload-url.dto';

export function generateFileKey(
  configService: ConfigService,
  dto: GenerateUploadUrlDto | GenerateMultipartUploadUrlDto,
): string {
  const environment = configService.getOrThrow<string>('NODE_ENV') || 'dev';
  const timestamp = Date.now();

  const envPrefix = getEnvironmentPrefix(environment);
  
  return `${envPrefix}/${dto.entity_type}/${dto.entity_id}/${dto.media_type}_${timestamp}.${dto.file_extension}`;
}

function getEnvironmentPrefix(environment: string): string {
  switch (environment.toLowerCase()) {
    case 'development':
    case 'dev':
      return 'd';
    case 'test':
      return 't';
    case 'staging':
      return 's';
    case 'production':
    case 'prod':
      return 'p';
    default:
      throw new Error(`Invalid environment: ${environment}`);
  }
}

/**
 * Generates a structured S3 key with the following format:
 * {env_prefix}/{entity_type}/{entity_id}/{media_type}_{timestamp}.{file_extension}
 * 
 * Examples:
 * - d/user/user_123/avatar_1735123456789.jpg
 * - p/course/course_456/video_1735123456789.mp4
 * - s/product/product_789/thumbnail_1735123456789.png
 * 
 * Environment prefixes:
 * - d: development
 * - t: test
 * - s: staging
 * - p: production
 */