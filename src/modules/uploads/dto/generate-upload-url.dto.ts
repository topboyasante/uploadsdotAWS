import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateUploadUrlDto {
  @ApiPropertyOptional({
    description: 'File extension for the upload (e.g., "jpg", "mp4")',
    example: 'mp4',
  })
  @IsOptional()
  @IsString()
  fileExtension?: string;

  @ApiPropertyOptional({
    description: 'MIME type of the file being uploaded',
    example: 'video/mp4',
  })
  @IsOptional()
  @IsString()
  contentType?: string;
}
