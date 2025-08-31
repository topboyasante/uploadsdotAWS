import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GenerateMultipartUploadUrlDto {
  @IsNumber()
  @Min(1)
  partCount: number;

  @IsOptional()
  @IsString()
  fileExtension?: string;

  @IsOptional()
  @IsString()
  contentType?: string;
}