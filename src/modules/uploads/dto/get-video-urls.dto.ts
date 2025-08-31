import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class GetVideoUrlsDto {
  @IsString()
  s3Key: string;

  @IsOptional()
  @IsArray()
  @IsIn(['low', 'medium', 'high', 'ultra'], { each: true })
  qualities?: Array<'low' | 'medium' | 'high' | 'ultra'>;

  @IsOptional()
  @IsString()
  @IsIn(['mp4', 'hls', 'both'])
  format?: 'mp4' | 'hls' | 'both';
}