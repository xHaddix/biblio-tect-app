/* eslint-disable @typescript-eslint/require-await */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const PRESIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60; // 1 hora

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly publicClient: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.MINIO_BUCKET ?? 'books-images';

    const useSsl = process.env.MINIO_USE_SSL === 'true';
    const credentials = {
      accessKeyId: process.env.MINIO_ACCESS_KEY ?? '',
      secretAccessKey: process.env.MINIO_SECRET_KEY ?? '',
    };

    // Si el puerto es 443 u 80, no lo agregamos a la URL para evitar problemas de formato
    const port = process.env.MINIO_PORT;
    const portSuffix =
      port && port !== '443' && port !== '80' ? `:${port}` : '';

    // Si la URL ya incluye /storage/v1/s3 (Supabase) no agregamos subrutas extra
    const endpointHost = process.env.MINIO_ENDPOINT ?? 'localhost';
    const endpointUrl =
      endpointHost.includes('supabase.co') &&
      !endpointHost.includes('/storage/v1/s3')
        ? `${useSsl ? 'https' : 'http'}://${endpointHost}${portSuffix}/storage/v1/s3`
        : `${useSsl ? 'https' : 'http'}://${endpointHost}${portSuffix}`;

    const publicHost = process.env.MINIO_PUBLIC_ENDPOINT ?? endpointHost;
    const publicPort = process.env.MINIO_PUBLIC_PORT ?? port;
    const publicPortSuffix =
      publicPort && publicPort !== '443' && publicPort !== '80'
        ? `:${publicPort}`
        : '';

    const publicEndpointUrl =
      publicHost.includes('supabase.co') &&
      !publicHost.includes('/storage/v1/s3')
        ? `${useSsl ? 'https' : 'http'}://${publicHost}${publicPortSuffix}/storage/v1/s3`
        : `${useSsl ? 'https' : 'http'}://${publicHost}${publicPortSuffix}`;

    const region = process.env.AWS_REGION ?? 'us-east-2';

    this.client = new S3Client({
      endpoint: endpointUrl,
      region,
      credentials,
      forcePathStyle: true,
    });

    this.publicClient = new S3Client({
      endpoint: publicEndpointUrl,
      region,
      credentials,
      forcePathStyle: true,
    });
  }

  async onModuleInit() {
    // Comentamos la creación automática ya que el bucket "books-images" existe en Supabase
    this.logger.log(
      `StorageService inicializado para el bucket "${this.bucket}"`,
    );
  }

  async uploadFile(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return key;
  }

  async deleteFile(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  async getPresignedUrl(key: string): Promise<string> {
    return getSignedUrl(
      this.publicClient,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: PRESIGNED_URL_EXPIRES_IN_SECONDS },
    );
  }
}
