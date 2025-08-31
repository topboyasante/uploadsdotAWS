import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto';
import { GenerateMultipartUploadUrlDto } from './dto/generate-multipart-upload-url.dto';
import { StartTranscodingDto } from './dto/start-transcoding.dto';
import { GetVideoUrlsDto } from './dto/get-video-urls.dto';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  create(@Body() createUploadDto: CreateUploadDto) {
    return this.uploadsService.create(createUploadDto);
  }

  @Get()
  findAll() {
    return this.uploadsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uploadsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUploadDto: UpdateUploadDto) {
    return this.uploadsService.update(+id, updateUploadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uploadsService.remove(+id);
  }

  // Upload endpoints
  @ApiOperation({
    summary: 'Generate presigned URL for file upload',
    tags: ['uploads'],
  })
  @ApiResponse({
    status: 201,
    description: 'Presigned URL generated successfully',
  })
  @Post('generate-upload-url')
  generateUploadUrl(@Body() dto: GenerateUploadUrlDto) {
    return this.uploadsService.generateUploadUrl(
      dto.fileExtension,
      dto.contentType,
    );
  }

  @ApiOperation({
    summary: 'Generate presigned URLs for multipart upload',
    tags: ['uploads'],
  })
  @ApiResponse({
    status: 201,
    description: 'Multipart upload URLs generated successfully',
  })
  @Post('generate-multipart-upload-url')
  generateMultipartUploadUrl(@Body() dto: GenerateMultipartUploadUrlDto) {
    return this.uploadsService.generateMultipartUploadUrl(
      dto.partCount,
      dto.fileExtension,
      dto.contentType,
    );
  }

  @ApiOperation({
    summary: 'List uploaded files in S3 bucket',
    tags: ['uploads'],
  })
  @ApiQuery({
    name: 'prefix',
    required: false,
    description: 'S3 key prefix filter',
  })
  @ApiQuery({
    name: 'maxKeys',
    required: false,
    description: 'Maximum number of files to return',
  })
  @ApiResponse({ status: 200, description: 'Files listed successfully' })
  @Get('list-files')
  listFiles(
    @Query('prefix') prefix?: string,
    @Query('maxKeys') maxKeys?: number,
  ) {
    return this.uploadsService.listFiles(prefix, maxKeys);
  }

  // CloudFront/viewing endpoints
  @ApiOperation({
    summary: 'Get CloudFront signed URL for file viewing',
    tags: ['viewing'],
  })
  @ApiResponse({
    status: 201,
    description: 'Signed URL generated successfully',
  })
  @Post('get-signed-url')
  getSignedUrl(
    @Body('s3Key') s3Key: string,
    @Body('expiresIn') expiresIn?: number,
  ) {
    return this.uploadsService.getSignedUrl(s3Key, expiresIn);
  }

  @ApiOperation({
    summary: 'Get video URLs for transcoded formats',
    tags: ['viewing'],
  })
  @ApiResponse({
    status: 201,
    description: 'Video URLs generated successfully',
  })
  @Post('get-video-urls')
  getVideoUrls(@Body() dto: GetVideoUrlsDto) {
    return this.uploadsService.getVideoUrls(
      dto.s3Key,
      dto.qualities || ['medium'],
      dto.format || 'both',
    );
  }

  // Transcoding endpoints
  @ApiOperation({
    summary: 'Start video transcoding job',
    tags: ['transcoding'],
  })
  @ApiResponse({
    status: 201,
    description: 'Transcoding job started successfully',
  })
  @Post('start-transcoding')
  startTranscoding(@Body() dto: StartTranscodingDto) {
    return this.uploadsService.startTranscoding(
      dto.inputS3Key,
      dto.outputFormats,
    );
  }

  @ApiOperation({
    summary: 'Get transcoding job status',
    tags: ['transcoding'],
  })
  @ApiParam({ name: 'jobId', description: 'MediaConvert job ID' })
  @ApiResponse({
    status: 200,
    description: 'Job status retrieved successfully',
  })
  @Get('transcoding-status/:jobId')
  getTranscodingStatus(@Param('jobId') jobId: string) {
    return this.uploadsService.getTranscodingStatus(jobId);
  }

  @ApiOperation({
    summary: 'List recent transcoding jobs',
    tags: ['transcoding'],
  })
  @ApiQuery({
    name: 'maxResults',
    required: false,
    description: 'Maximum number of jobs to return',
  })
  @ApiResponse({ status: 200, description: 'Jobs listed successfully' })
  @Get('transcoding-jobs')
  listTranscodingJobs(@Query('maxResults') maxResults?: number) {
    return this.uploadsService.listTranscodingJobs(maxResults);
  }
}
