import { Module } from '@nestjs/common';
import { MediaconvertService } from './mediaconvert.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MediaconvertService],
  exports: [MediaconvertService],
})
export class MediaconvertModule {}
