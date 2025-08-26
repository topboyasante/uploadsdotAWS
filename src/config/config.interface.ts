export interface IAppConfig {
  database: {
    url: string;
  };
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    s3: {
      imageBucket: string;
      videoInputBucket: string;
      videoOutputBucket: string;
    };
    cloudfront: {
      imageDomainName: string;
      videoDomainName: string;
      keyPairId: string;
      privateKey: string;
    };
    mediaConvert: {
      cmaf: {
        queue: string;
        role: string;
        jobTemplate: string;
      };
    };
  };
}
