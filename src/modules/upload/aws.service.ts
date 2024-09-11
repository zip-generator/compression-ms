import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { envs } from '@app/config';

const expiesIn = 300; // is 300 seconds = 5 minutes
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
  }: IUploadFile): Promise<{ url: string; key: string }> {
    const pathFile = `${folder}/${fileName}`;
    const uploadParams = {
      Bucket: envs.awsBucketName,
      Key: pathFile,
      Body: zipFile,
    };

    const command = new PutObjectCommand(uploadParams);
    await this.s3Client.send(command);
    const url = this.getObjectUrl(pathFile);
    return {
      url,
      key: pathFile,
    };
  }

  downloadFile(key: string): Promise<string> {
    const comand = new GetObjectCommand({
      Bucket: envs.awsBucketName,
      Key: key,
    });
    return getSignedUrl(this.s3Client, comand, { expiresIn: expiesIn });
  }

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
  private getObjectUrl(key: string): string {
    return `https://${envs.awsBucketName}.s3.${envs.awsRegion}.amazonaws.com/${key}`;
  }
}
