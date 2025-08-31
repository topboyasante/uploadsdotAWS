import { ApiProperty } from '@nestjs/swagger';

export class UploadUrlResponseDto {
  @ApiProperty({
    description: 'Presigned S3 upload URL',
    example: 'https://bucket-name.s3.region.amazonaws.com/uploads/timestamp-uuid.ext?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...',
  })
  url: string;

  @ApiProperty({
    description: 'S3 object key for the uploaded file',
    example: 'd/user/user_123/avatar_1735123456789.mp4',
  })
  key: string;
}

export class MultipartUploadResponseDto {
  @ApiProperty({
    description: 'Multipart upload ID from AWS S3',
    example: 'exampleUploadId123ABC',
  })
  uploadId: string;

  @ApiProperty({
    description: 'S3 object key for the uploaded file',
    example: 'd/user/user_123/avatar_1735123456789.mp4',
  })
  key: string;

  @ApiProperty({
    description: 'Array of presigned URLs for each part',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        partNumber: {
          type: 'number',
          description: 'Part number (1-indexed)',
          example: 1,
        },
        url: {
          type: 'string',
          description: 'Presigned URL for this part',
          example: 'https://bucket-name.s3.region.amazonaws.com/uploads/file?partNumber=1&uploadId=...',
        },
      },
    },
  })
  partUrls: Array<{
    partNumber: number;
    url: string;
  }>;
}