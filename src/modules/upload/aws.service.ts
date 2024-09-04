import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { envs } from '@app/config';

interface IConfigFile {
  bucketName: string;
  region: string;
}

interface IPartialUploadFile {
  fileKey: string;
  baseConfig: IConfigFile;
  accessKeyId: string;
  secretAccessKey: string;
}

interface IS3Client {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  endPoint?: string;
}

interface IUploadFile {
  folder: string;
  zipFile: Buffer;
  fileName: string;
}
@Injectable()
export class AwsService {
  private s3Client: S3Client;
  constructor() {
    this.s3Client = this.createS3Client({
      accessKeyId: envs.awsAccessKeyId,
      secretAccessKey: envs.awsSecretAccessKey,
      region: envs.awsRegion,
      endPoint: envs.awsEndpoint,
    });
  }

  private createS3Client({
    accessKeyId,
    secretAccessKey,
    region,
  }: IS3Client): S3Client {
    return new S3Client({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region,
    });
  }

  async uploadFile({
    zipFile,
    folder,
    fileName,
  }: IUploadFile): Promise<PutObjectCommandOutput> {
    const pathFile = `${folder}/${fileName}`;
    const uploadParams = {
      Bucket: envs.awsBucketName,
      Key: pathFile,
      Body: zipFile,
    };

    const command = new PutObjectCommand(uploadParams);
    const response = await this.s3Client.send(command);
    return response;
  }

  // async getFiles({
  //   baseConfig,
  //   accessKeyId,
  //   secretAccessKey,
  //   endPoint,
  //   fileKey,
  // }: IPartialUploadFile): Promise<Readable> {
  //   const s3Client = this.createS3Client({
  //     accessKeyId,
  //     secretAccessKey,
  //     region,
  //     endPoint,
  //   });
  //   await this.headObjectAws(baseConfig.bucketName, fileKey, s3Client);

  //   const getObjectParams = {
  //     Bucket: baseConfig.bucketName,
  //     Key: fileKey,
  //   };

  //   const command = new GetObjectCommand(getObjectParams);
  //   const response = await s3Client.send(command);
  //   return response.Body as Readable;
  // }

  async deleteObjectAws({ fileKey }: IPartialUploadFile) {
    await this.headObjectAws(envs.awsBucketName, fileKey);

    const deleteObjectParams = {
      Bucket: envs.awsBucketName,
      Key: fileKey,
    };

    const command = new DeleteObjectCommand(deleteObjectParams);
    const response = await this.s3Client.send(command);
    return response;
  }

  async headObjectAws(bucketName: string, fileKey: string) {
    const headObjectParams = {
      Bucket: bucketName,
      Key: fileKey,
    };

    const command = new HeadObjectCommand(headObjectParams);
    return await this.s3Client.send(command);
  }
}
