import { ApiProperty } from '@nestjs/swagger';

export class TranscodingJobResponseDto {
  @ApiProperty({
    description: 'MediaConvert job ID',
    example: '1735123456789-abc123',
  })
  jobId: string;

  @ApiProperty({
    description: 'Initial job status',
    example: 'SUBMITTED',
    enum: ['SUBMITTED', 'PROGRESSING', 'COMPLETE', 'CANCELED', 'ERROR'],
  })
  status: string;
}

export class TranscodingJobStatusDto {
  @ApiProperty({
    description: 'Current job status',
    example: 'PROGRESSING',
    enum: ['SUBMITTED', 'PROGRESSING', 'COMPLETE', 'CANCELED', 'ERROR'],
  })
  status: string;

  @ApiProperty({
    description: 'Job completion percentage (0-100)',
    example: 45,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  progress?: number;

  @ApiProperty({
    description: 'Error message if job failed',
    example: 'Input file format not supported',
    required: false,
  })
  errorMessage?: string;
}

export class TranscodingJobListItemDto {
  @ApiProperty({
    description: 'Job ID',
    example: '1735123456789-abc123',
  })
  id: string;

  @ApiProperty({
    description: 'Job status',
    example: 'COMPLETE',
    enum: ['SUBMITTED', 'PROGRESSING', 'COMPLETE', 'CANCELED', 'ERROR'],
  })
  status: string;

  @ApiProperty({
    description: 'Job creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
    required: false,
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Job completion percentage',
    example: 100,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  progress?: number;
}