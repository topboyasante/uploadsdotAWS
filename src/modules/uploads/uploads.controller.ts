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
import { GetSignedUrlDto } from './dto/get-signed-url.dto';
import {
  UploadUrlResponseDto,
  MultipartUploadResponseDto,
} from './dto/upload-url-response.dto';
import {
  TranscodingJobResponseDto,
  TranscodingJobStatusDto,
  TranscodingJobListItemDto,
} from './dto/transcoding-response.dto';
import {
  S3FileDto,
  VideoUrlsResponseDto,
} from './dto/s3-file-list-response.dto';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @ApiOperation({
    summary: 'Create a new upload record',
    description: 'Creates a new upload record in the database',
  })
  @ApiResponse({
    status: 201,
    description: 'Upload record created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        key: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        metadata: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post()
  create(@Body() createUploadDto: CreateUploadDto) {
    return this.uploadsService.create(createUploadDto);
  }

  @ApiOperation({
    summary: 'Get all upload records',
    description: 'Retrieves all upload records from the database',
  })
  @ApiResponse({
    status: 200,
    description: 'Upload records retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          key: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          metadata: { type: 'object' },
        },
      },
    },
  })
  @Get()
  findAll() {
    return this.uploadsService.findAll();
  }

  @ApiOperation({
    summary: 'Get upload record by ID',
    description: 'Retrieves a specific upload record by its ID',
  })
  @ApiParam({ name: 'id', description: 'Upload record ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Upload record found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        key: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        metadata: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Upload record not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uploadsService.findOne(+id);
  }

  @ApiOperation({
    summary: 'Update upload record',
    description: 'Updates an existing upload record',
  })
  @ApiParam({ name: 'id', description: 'Upload record ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Upload record updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Upload record not found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUploadDto: UpdateUploadDto) {
    return this.uploadsService.update(+id, updateUploadDto);
  }

  @ApiOperation({
    summary: 'Delete upload record',
    description: 'Deletes an upload record from the database',
  })
  @ApiParam({ name: 'id', description: 'Upload record ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Upload record deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Upload record not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uploadsService.remove(+id);
  }

  // Upload endpoints
  @ApiOperation({
    summary: 'Generate presigned URL for file upload',
    description:
      'Generates a presigned S3 URL for direct file upload. The URL expires in 1 hour.',
    tags: ['uploads'],
  })
  @ApiResponse({
    status: 201,
    description: 'Presigned URL generated successfully',
    type: UploadUrlResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @Post('generate-upload-url')
  generateUploadUrl(@Body() dto: GenerateUploadUrlDto) {
    return this.uploadsService.generateUploadUrl(dto);
  }

  @ApiOperation({
    summary: 'Generate presigned URLs for multipart upload',
    description:
      'Generates presigned URLs for multipart upload. Use this for large files (>100MB). Each part URL expires in 1 hour.',
    tags: ['uploads'],
  })
  @ApiResponse({
    status: 201,
    description: 'Multipart upload URLs generated successfully',
    type: MultipartUploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @Post('generate-multipart-upload-url')
  generateMultipartUploadUrl(@Body() dto: GenerateMultipartUploadUrlDto) {
    return this.uploadsService.generateMultipartUploadUrl(dto);
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
  @ApiResponse({
    status: 200,
    description: 'Files listed successfully',
    type: [S3FileDto],
  })
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
    description:
      'Generates a signed CloudFront URL for secure file access. Default expiry is 1 hour.',
    tags: ['viewing'],
  })
  @ApiResponse({
    status: 201,
    description: 'Signed URL generated successfully',
    schema: {
      type: 'string',
      description: 'Signed CloudFront URL',
      example:
        'https://d123456789.cloudfront.net/uploads/file.mp4?Policy=...&Signature=...&Key-Pair-Id=...',
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid S3 key or parameters' })
  @Post('get-signed-url')
  getSignedUrl(@Body() dto: GetSignedUrlDto) {
    return this.uploadsService.getSignedUrl(dto.s3Key, dto.expiresIn);
  }

  @ApiOperation({
    summary: 'Get video URLs for transcoded formats',
    description:
      'Generates signed URLs for transcoded video files in different qualities and formats (MP4/HLS).',
    tags: ['viewing'],
  })
  @ApiResponse({
    status: 201,
    description: 'Video URLs generated successfully',
    type: VideoUrlsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
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
    description:
      'Starts an AWS MediaConvert job to transcode video into multiple formats and qualities.',
    tags: ['transcoding'],
  })
  @ApiResponse({
    status: 201,
    description: 'Transcoding job started successfully',
    type: TranscodingJobResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input parameters' })
  @ApiResponse({ status: 404, description: 'Input file not found in S3' })
  @Post('start-transcoding')
  startTranscoding(@Body() dto: StartTranscodingDto) {
    return this.uploadsService.startTranscoding(
      dto.inputS3Key,
      dto.outputFormats,
    );
  }

  @ApiOperation({
    summary: 'Get transcoding job status',
    description:
      'Retrieves the current status and progress of a MediaConvert transcoding job.',
    tags: ['transcoding'],
  })
  @ApiParam({
    name: 'jobId',
    description: 'MediaConvert job ID returned from start-transcoding endpoint',
    example: '1735123456789-abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Job status retrieved successfully',
    type: TranscodingJobStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @Get('transcoding-status/:jobId')
  getTranscodingStatus(@Param('jobId') jobId: string) {
    return this.uploadsService.getTranscodingStatus(jobId);
  }

  @ApiOperation({
    summary: 'List recent transcoding jobs',
    description:
      'Lists recent MediaConvert transcoding jobs in descending order by creation date.',
    tags: ['transcoding'],
  })
  @ApiQuery({
    name: 'maxResults',
    required: false,
    description: 'Maximum number of jobs to return (default: 20)',
    example: 10,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Jobs listed successfully',
    type: [TranscodingJobListItemDto],
  })
  @Get('transcoding-jobs')
  listTranscodingJobs(@Query('maxResults') maxResults?: number) {
    return this.uploadsService.listTranscodingJobs(maxResults);
  }
}
