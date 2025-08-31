import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetSignedUrlDto {
  @ApiProperty({
    description: 'S3 object key for the file to generate signed URL',
    example: 'd/user/user_123/avatar_1735123456789.mp4',
  })
  @IsNotEmpty()
  @IsString()
  s3Key: string;

  @ApiPropertyOptional({
    description: 'Expiration time in seconds (default: 3600 = 1 hour)',
    example: 3600,
    minimum: 60,
    maximum: 86400,
  })
  @IsOptional()
  @IsNumber()
  @Min(60)
  expiresIn?: number;
}