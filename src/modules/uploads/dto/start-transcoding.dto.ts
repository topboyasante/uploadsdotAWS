import { IsArray, IsIn, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OutputFormatDto {
  @ApiProperty({
    description: 'Output format for transcoding',
    enum: ['mp4', 'hls', 'dash'],
    example: 'mp4',
  })
  @IsString()
  @IsIn(['mp4', 'hls', 'dash'])
  format: 'mp4' | 'hls' | 'dash';

  @ApiProperty({
    description: 'Quality level for transcoding',
    enum: ['low', 'medium', 'high', 'ultra'],
    example: 'medium',
  })
  @IsString()
  @IsIn(['low', 'medium', 'high', 'ultra'])
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

export class StartTranscodingDto {
  @ApiProperty({
    description: 'S3 key of the input video file',
    example: 'uploads/1735123456789-abc123.mp4',
  })
  @IsString()
  inputS3Key: string;

  @ApiProperty({
    description: 'Array of output formats and qualities to generate',
    type: [OutputFormatDto],
    example: [
      { format: 'mp4', quality: 'medium' },
      { format: 'hls', quality: 'high' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OutputFormatDto)
  outputFormats: OutputFormatDto[];
}