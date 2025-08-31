import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Uploads AWS API')
    .setDescription(
      'API for file uploads, transcoding, and CloudFront delivery',
    )
    .setVersion('1.0')
    .addTag('uploads', 'File upload operations')
    .addTag('transcoding', 'Video transcoding operations')
    .addTag('viewing', 'File viewing and CloudFront operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
