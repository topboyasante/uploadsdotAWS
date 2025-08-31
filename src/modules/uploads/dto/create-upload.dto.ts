import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUploadDto {
  @ApiProperty({
    description: 'S3 key/path of the uploaded file',
    example: 'd/user/user_123/avatar_1735123456789.mp4',
  })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the upload',
    example: {
      originalName: 'my-video.mp4',
      fileSize: 1048576,
      contentType: 'video/mp4',
      uploadedBy: 'user123'
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
