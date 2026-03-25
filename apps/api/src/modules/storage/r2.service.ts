import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = this.configService.get<string>('R2_BUCKET') || 'autowhats';

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      this.logger.warn('⚠️ R2 credentials not fully configured in environment.');
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });
  }

  async downloadFile(key: string, outputPath: string): Promise<void> {
    try {
      this.logger.log(`📥 Downloading ${key} from R2 to ${outputPath}...`);
      
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('R2 response body is empty');
      }

      const stream = response.Body as Readable;
      await fs.ensureDir(path.dirname(outputPath));
      const writer = fs.createWriteStream(outputPath);

      return new Promise((resolve, reject) => {
        stream.pipe(writer);
        writer.on('finish', () => {
          this.logger.log(`✅ Download complete: ${outputPath}`);
          resolve();
        });
        writer.on('error', (err) => {
          this.logger.error(`❌ Write error: ${err.message}`);
          reject(err);
        });
      });
    } catch (error: any) {
      this.logger.error(`❌ Failed to download file from R2: ${error.message}`);
      throw error;
    }
  }
}
