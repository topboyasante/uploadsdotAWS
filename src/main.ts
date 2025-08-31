import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error for unknown properties
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Uploads AWS API')
    .setDescription(
      `
## Overview
A comprehensive API for handling file uploads, video transcoding, and secure content delivery using AWS services.

### Features
- 🗃️ **File Upload Management**: Direct S3 uploads with presigned URLs
- 📹 **Video Transcoding**: AWS MediaConvert integration for multi-format video processing
- 🌐 **Content Delivery**: Secure CloudFront URLs for file access
- 📊 **Database Tracking**: PostgreSQL integration for upload record management

### AWS Services Used
- **S3**: File storage and multipart uploads
- **MediaConvert**: Video transcoding to multiple formats and qualities
- **CloudFront**: Content delivery network with signed URLs
- **IAM**: Secure service-to-service authentication

### Supported Video Formats
- **Input**: MP4, MOV, AVI, MKV
- **Output**: MP4, HLS (HTTP Live Streaming)
- **Quality Levels**: Low (640x360), Medium (1280x720), High (1920x1080), Ultra (3840x2160)

### Authentication
This API uses AWS IAM roles for service authentication. Ensure your environment is properly configured with AWS credentials.
    `,
    )
    .setVersion('1.0')
    .addTag('uploads', 'File upload operations and record management')
    .addTag('transcoding', 'Video transcoding with AWS MediaConvert')
    .addTag('viewing', 'File viewing and secure CloudFront delivery')
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://your-domain.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
