import { IAppConfig } from './config.interface';

export const AppConfig = (): IAppConfig => ({
  database: {
    url: process.env.DATABASE_URL || '',
  },
  aws: {
    region: process.env.AWS_REGION || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3: {
      imageBucket: process.env.S3_IMAGE_BUCKET || '',
      videoInputBucket: process.env.S3_VIDEO_INPUT_BUCKET || '',
      videoOutputBucket: process.env.S3_VIDEO_OUTPUT_BUCKET || '',
    },
    cloudfront: {
      imageDomainName: process.env.CLOUDFRONT_IMAGE_DOMAIN_NAME || '',
      videoDomainName: process.env.CLOUDFRONT_VIDEO_DOMAIN_NAME || '',
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID || '',
      privateKey: process.env.CLOUDFRONT_PRIVATE_KEY_PATH || './keys/cloudfront-private-key.pem',
    },
    mediaConvert: {
      cmaf: {
        queue: process.env.MEDIACONVERT_CMAF_QUEUE || '',
        role: process.env.MEDIACONVERT_CMAF_ROLE || '',
        jobTemplate: process.env.MEDIACONVERT_CMAF_JOB_TEMPLATE || '',
      },
    },
  },
});
