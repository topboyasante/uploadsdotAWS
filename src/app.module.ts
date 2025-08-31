import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfig } from './config/config';
import { UploadsModule } from './modules/uploads/uploads.module';
import { Upload } from './modules/uploads/entities/upload.entity';
import { S3Module } from './providers/s3/s3.module';
import { MediaconvertModule } from './providers/mediaconvert/mediaconvert.module';
import { CloudfrontModule } from './providers/cloudfront/cloudfront.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [AppConfig] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url'),
        entities: [Upload],
        synchronize: false,
        migrations: ['dist/migrations/*{.ts,.js}'],
        migrationsRun: true,
      }),
      inject: [ConfigService],
    }),
    UploadsModule,
    S3Module,
    MediaconvertModule,
    CloudfrontModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly dataSource: DataSource) {}

  onModuleInit() {
    if (this.dataSource.isInitialized) {
      this.logger.log('✅ Database connected successfully');
      this.logger.log(`📊 Database: ${this.dataSource.options.type}`);
    } else {
      this.logger.error('❌ Database connection failed');
    }
  }
}
