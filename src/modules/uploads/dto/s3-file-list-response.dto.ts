import { ApiProperty } from '@nestjs/swagger';

export class S3FileDto {
  @ApiProperty({
    description: 'S3 object key',
    example: 'd/user/user_123/avatar_1735123456789.mp4',
  })
  Key: string;

  @ApiProperty({
    description: 'Last modified timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  LastModified: Date;

  @ApiProperty({
    description: 'Entity Tag (ETag) for the object',
    example: '"abc123def456"',
  })
  ETag: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1048576,
  })
  Size: number;

  @ApiProperty({
    description: 'S3 storage class',
    example: 'STANDARD',
    enum: ['STANDARD', 'REDUCED_REDUNDANCY', 'GLACIER', 'STANDARD_IA', 'ONEZONE_IA'],
    required: false,
  })
  StorageClass?: string;
}

export class VideoUrlsResponseDto {
  @ApiProperty({
    description: 'MP4 format URLs by quality',
    type: 'object',
    additionalProperties: {
      type: 'string',
      description: 'Signed CloudFront URL',
    },
    example: {
      medium: 'https://d123456789.cloudfront.net/transcoded/file-mp4-medium.mp4?Policy=...',
      high: 'https://d123456789.cloudfront.net/transcoded/file-mp4-high.mp4?Policy=...',
    },
  })
  mp4: Record<string, string>;

  @ApiProperty({
    description: 'HLS format URLs by quality',
    type: 'object',
    additionalProperties: {
      type: 'string',
      description: 'Signed CloudFront URL for HLS playlist',
    },
    example: {
      medium: 'https://d123456789.cloudfront.net/transcoded/file-hls-medium/index.m3u8?Policy=...',
      high: 'https://d123456789.cloudfront.net/transcoded/file-hls-high/index.m3u8?Policy=...',
    },
  })
  hls: Record<string, string>;
}