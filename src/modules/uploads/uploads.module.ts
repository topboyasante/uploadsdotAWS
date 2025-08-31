import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { S3Module } from '../../providers/s3/s3.module';
import { MediaconvertModule } from '../../providers/mediaconvert/mediaconvert.module';
import { CloudfrontModule } from '../../providers/cloudfront/cloudfront.module';

@Module({
  imports: [S3Module, MediaconvertModule, CloudfrontModule],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
