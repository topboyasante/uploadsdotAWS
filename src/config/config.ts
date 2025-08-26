import { IAppConfig } from './config.interface';

export const AppConfig = (): IAppConfig => ({
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/myapp',
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3: {
      imageBucket: process.env.AWS_S3_IMAGE_BUCKET || 'myapp-images',
      videoInputBucket:
        process.env.AWS_S3_VIDEO_INPUT_BUCKET || 'myapp-videos-input',
      videoOutputBucket:
        process.env.AWS_S3_VIDEO_OUTPUT_BUCKET || 'myapp-videos-output',
    },
    cloudfront: {
      imageDomainName:
        process.env.AWS_CLOUDFRONT_IMAGE_DOMAIN_NAME ||
        'd111111abcdef8.cloudfront.net',
      videoDomainName:
        process.env.AWS_CLOUDFRONT_VIDEO_DOMAIN_NAME ||
        'd111111abcdef8.cloudfront.net',
      keyPairId: process.env.AWS_CLOUDFRONT_KEY_PAIR_ID || '',
      privateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY || '',
    },
    mediaConvert: {
      cmaf: {
        queue:
          process.env.AWS_MEDIACONVERT_CMAF_QUEUE ||
          'arn:aws:mediaconvert:us-east-1:123456789012:queues/Default',
        role:
          process.env.AWS_MEDIACONVERT_CMAF_ROLE ||
          'arn:aws:iam::123456789012:role/MediaConvert_Default_Role',
        jobTemplate:
          process.env.AWS_MEDIACONVERT_CMAF_JOB_TEMPLATE || 'MyJobTemplate',
      },
    },
  },
});
