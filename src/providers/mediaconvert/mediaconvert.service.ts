import {
  MediaConvertClient,
  CreateJobCommand,
  GetJobCommand,
  ListJobsCommand,
  AudioDefaultSelection,
  H264RateControlMode,
  H264GopSizeUnits,
  AacCodingMode,
  OutputGroupType,
  VideoCodec,
  AudioCodec,
  ContainerType,
} from '@aws-sdk/client-mediaconvert';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class MediaconvertService {
  private mediaConvertClient: MediaConvertClient;
  private readonly logger = new Logger(MediaconvertService.name);

  constructor(private readonly configService: ConfigService) {
    this.mediaConvertClient = new MediaConvertClient({
      region: this.configService.getOrThrow<string>('aws.region'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('aws.accessKeyId'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'aws.secretAccessKey',
        ),
      },
    });
  }

  /**
   * Creates a transcoding job for converting video files
   * @param inputS3Key - S3 key of the input video file
   * @param outputFormats - Array of output formats to create
   * @returns Job ID and status
   */
  async CreateTranscodingJob(
    inputS3Key: string,
    outputFormats: Array<{
      format: 'mp4' | 'hls' | 'dash';
      quality: 'low' | 'medium' | 'high' | 'ultra';
    }>,
  ): Promise<{ jobId: string; status: string }> {
    const clientRequestToken = randomUUID(); // For idempotency, not the actual job ID
    const bucketName = this.configService.getOrThrow<string>(
      'aws.s3.videoInputBucket',
    );

    // Create output groups based on requested formats
    const outputGroups = outputFormats
      .map((format, index) => {
        const outputKey = `transcoded/${inputS3Key.replace(/\.[^/.]+$/, '')}-${format.format}-${format.quality}`;

        if (format.format === 'mp4') {
          return {
            Name: `MP4_${index}`,
            OutputGroupSettings: {
              Type: OutputGroupType.FILE_GROUP_SETTINGS,
              FileGroupSettings: {
                Destination: `s3://${bucketName}/${outputKey}`,
              },
            },
            Outputs: [
              {
                VideoDescription: {
                  CodecSettings: {
                    Codec: VideoCodec.H_264,
                    H264Settings: this.getH264Settings(format.quality),
                  },
                  Width: this.getResolution(format.quality).width,
                  Height: this.getResolution(format.quality).height,
                },
                AudioDescriptions: [
                  {
                    CodecSettings: {
                      Codec: AudioCodec.AAC,
                      AacSettings: {
                        Bitrate: 128000,
                        CodingMode: AacCodingMode.CODING_MODE_2_0,
                        SampleRate: 48000,
                      },
                    },
                  },
                ],
                ContainerSettings: {
                  Container: ContainerType.MP4,
                  Mp4Settings: {},
                },
              },
            ],
          };
        } else if (format.format === 'hls') {
          return {
            Name: `HLS_${index}`,
            OutputGroupSettings: {
              Type: OutputGroupType.HLS_GROUP_SETTINGS,
              HlsGroupSettings: {
                Destination: `s3://${bucketName}/${outputKey}/`,
                SegmentLength: 10,
                MinSegmentLength: 0,
              },
            },
            Outputs: [
              {
                VideoDescription: {
                  CodecSettings: {
                    Codec: VideoCodec.H_264,
                    H264Settings: this.getH264Settings(format.quality),
                  },
                  Width: this.getResolution(format.quality).width,
                  Height: this.getResolution(format.quality).height,
                },
                AudioDescriptions: [
                  {
                    CodecSettings: {
                      Codec: AudioCodec.AAC,
                      AacSettings: {
                        Bitrate: 128000,
                        CodingMode: AacCodingMode.CODING_MODE_2_0,
                        SampleRate: 48000,
                      },
                    },
                  },
                ],
                ContainerSettings: {
                  Container: ContainerType.M3U8,
                },
              },
            ],
          };
        }
        // Add DASH support if needed
        return null;
      })
      .filter((group): group is NonNullable<typeof group> => group !== null);

    const jobSettings = {
      Role: this.configService.getOrThrow<string>('aws.mediaConvert.cmaf.role'),
      Settings: {
        Inputs: [
          {
            FileInput: `s3://${bucketName}/${inputS3Key}`,
            AudioSelectors: {
              'Audio Selector 1': {
                DefaultSelection: AudioDefaultSelection.DEFAULT,
              },
            },
            VideoSelector: {},
          },
        ],
        OutputGroups: outputGroups,
      },
    };

    const command = new CreateJobCommand({
      ...jobSettings,
      ClientRequestToken: clientRequestToken,
    });

    const response = await this.mediaConvertClient.send(command);

    this.logger.log(
      `Created transcoding job: ${response.Job?.Id} for input: ${inputS3Key}`,
    );

    return {
      jobId: response.Job?.Id as string, // AWS MediaConvert generates the actual job ID
      status: response.Job?.Status || 'SUBMITTED',
    };
  }

  /**
   * Gets the status of a transcoding job
   * @param jobId - The job ID to check
   * @returns Job status and progress information
   */
  async GetJobStatus(jobId: string): Promise<{
    status: string;
    progress?: number;
    errorMessage?: string;
  }> {
    const command = new GetJobCommand({ Id: jobId });
    const response = await this.mediaConvertClient.send(command);

    return {
      status: response.Job?.Status || 'UNKNOWN',
      progress: response.Job?.JobPercentComplete,
      errorMessage: response.Job?.ErrorMessage,
    };
  }

  /**
   * Lists recent transcoding jobs
   * @param maxResults - Maximum number of jobs to return
   * @returns Array of job information
   */
  async ListJobs(maxResults: number = 20): Promise<
    Array<{
      id: string;
      status: string;
      createdAt?: Date;
      progress?: number;
    }>
  > {
    const command = new ListJobsCommand({
      MaxResults: maxResults,
      Order: 'DESCENDING',
    });

    const response = await this.mediaConvertClient.send(command);

    return (
      response.Jobs?.map((job) => ({
        id: job.Id!,
        status: job.Status!,
        createdAt: job.CreatedAt,
        progress: job.JobPercentComplete,
      })) || []
    );
  }

  private getH264Settings(quality: 'low' | 'medium' | 'high' | 'ultra') {
    const settings = {
      low: { Bitrate: 1000000, MaxBitrate: 1200000 },
      medium: { Bitrate: 2500000, MaxBitrate: 3000000 },
      high: { Bitrate: 5000000, MaxBitrate: 6000000 },
      ultra: { Bitrate: 8000000, MaxBitrate: 10000000 },
    };

    return {
      RateControlMode: H264RateControlMode.CBR,
      ...settings[quality],
      GopSize: 90,
      GopSizeUnits: H264GopSizeUnits.FRAMES,
    };
  }

  private getResolution(quality: 'low' | 'medium' | 'high' | 'ultra') {
    const resolutions = {
      low: { width: 640, height: 360 },
      medium: { width: 1280, height: 720 },
      high: { width: 1920, height: 1080 },
      ultra: { width: 3840, height: 2160 },
    };

    return resolutions[quality];
  }
}
