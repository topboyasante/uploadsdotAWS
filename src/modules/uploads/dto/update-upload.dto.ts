import { PartialType } from '@nestjs/swagger';
import { CreateUploadDto } from './create-upload.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUploadDto extends PartialType(CreateUploadDto) {
  @ApiPropertyOptional({
    description: 'S3 key/path of the uploaded file',
    example: 'd/user/user_123/avatar_1735123456789.mp4',
  })
  key?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the upload',
    example: {
      originalName: 'my-video.mp4',
      fileSize: 1048576,
      contentType: 'video/mp4',
      uploadedBy: 'user123',
      transcoded: true,
      transcodingJobId: 'job-abc123'
    },
  })
  metadata?: Record<string, any>;
}
