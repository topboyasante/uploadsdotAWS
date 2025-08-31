import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetVideoUrlsDto {
  @ApiProperty({
    description: 'S3 key of the original video file',
    example: 'd/course/course_456/video_1735123456789.mp4',
  })
  @IsString()
  s3Key: string;

  @ApiPropertyOptional({
    description: 'Array of quality levels to get URLs for',
    enum: ['low', 'medium', 'high', 'ultra'],
    isArray: true,
    example: ['medium', 'high'],
  })
  @IsOptional()
  @IsArray()
  @IsIn(['low', 'medium', 'high', 'ultra'], { each: true })
  qualities?: Array<'low' | 'medium' | 'high' | 'ultra'>;

  @ApiPropertyOptional({
    description: 'Format type to get URLs for',
    enum: ['mp4', 'hls', 'both'],
    example: 'both',
  })
  @IsOptional()
  @IsString()
  @IsIn(['mp4', 'hls', 'both'])
  format?: 'mp4' | 'hls' | 'both';
}