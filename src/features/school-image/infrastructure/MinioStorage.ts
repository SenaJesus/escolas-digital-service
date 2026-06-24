import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import type { ObjectStorage } from '../domain/ports'

type S3Settings = {
  endpoint: string
  publicUrl: string
  region: string
  accessKey: string
  secretKey: string
  bucket: string
}

export class MinioStorage implements ObjectStorage {
  private readonly client: S3Client
  private readonly bucket: string
  private readonly publicBaseUrl: string

  constructor(settings: S3Settings) {
    this.bucket = settings.bucket
    this.publicBaseUrl = settings.publicUrl
    this.client = new S3Client({
      endpoint: settings.endpoint,
      region: settings.region,
      credentials: { accessKeyId: settings.accessKey, secretAccessKey: settings.secretKey },
      forcePathStyle: true,
    })
  }

  async put(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType }),
    )
  }

  async remove(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
  }

  publicUrl(key: string): string {
    return `${this.publicBaseUrl}/${this.bucket}/${key}`
  }

  async ensureBucket(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }))
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }))
    }

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucket}/*`],
        },
      ],
    }

    await this.client.send(
      new PutBucketPolicyCommand({ Bucket: this.bucket, Policy: JSON.stringify(policy) }),
    )
  }
}
