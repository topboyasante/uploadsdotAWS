import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateMultipartUploadUrlDto {
  @ApiProperty({
    description: 'Number of parts for multipart upload',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  partCount: number;

  @ApiProperty({
    description: 'Type of entity (e.g., "user", "product", "course")',
    example: 'user',
  })
  @IsNotEmpty()
  @IsString()
  entity_type: string;

  @ApiProperty({
    description: 'ID of the entity',
    example: 'user_123',
  })
  @IsNotEmpty()
  @IsString()
  entity_id: string;

  @ApiProperty({
    description: 'Type of media (e.g., "avatar", "video", "thumbnail")',
    example: 'video',
  })
  @IsNotEmpty()
  @IsString()
  media_type: string;

  @ApiProperty({
    description: 'File extension (e.g., "jpg", "mp4", "png")',
    example: 'mp4',
  })
  @IsNotEmpty()
  @IsString()
  file_extension: string;

  @ApiPropertyOptional({
    description: 'MIME type of the file being uploaded',
    example: 'video/mp4',
  })
  @IsOptional()
  @IsString()
  contentType?: string;
}