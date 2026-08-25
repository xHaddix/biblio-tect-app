import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const PRESIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60; // 1 hora

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  /** Cliente interno: usa el hostname de la red de Docker (ej. "minio") para subir/borrar archivos. */
  private readonly client: S3Client;
  /**
   * Cliente público: usa un endpoint accesible desde fuera de la red de Docker
   * (ej. "localhost:9000" o un dominio público) exclusivamente para generar URLs firmadas
   * que consumirán navegadores/clientes externos.
   */
  private readonly publicClient: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.MINIO_BUCKET ?? 'books-images';

    const useSsl = process.env.MINIO_USE_SSL === 'true';
    const credentials = {
      accessKeyId: process.env.MINIO_ACCESS_KEY ?? '',
      secretAccessKey: process.env.MINIO_SECRET_KEY ?? '',
    };

    this.client = new S3Client({
      endpoint: `${useSsl ? 'https' : 'http'}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
      region: 'us-east-1',
      credentials,
      forcePathStyle: true, // Requerido por MinIO
    });

    const publicEndpoint =
      process.env.MINIO_PUBLIC_ENDPOINT ?? process.env.MINIO_ENDPOINT;
    const publicPort = process.env.MINIO_PUBLIC_PORT ?? process.env.MINIO_PORT;

    this.publicClient = new S3Client({
      endpoint: `${useSsl ? 'https' : 'http'}://${publicEndpoint}:${publicPort}`,
      region: 'us-east-1',
      credentials,
      forcePathStyle: true,
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.client.send(
          new CreateBucketCommand({ Bucket: this.bucket }),
        );
        this.logger.log(`Bucket "${this.bucket}" creado correctamente`);
      } catch (error) {
        this.logger.error(
          `No se pudo crear/verificar el bucket "${this.bucket}"`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
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
