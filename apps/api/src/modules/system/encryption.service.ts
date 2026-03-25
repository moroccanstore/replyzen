import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * AES-256-GCM Encryption Service
 *
 * Encrypts sensitive fields (metaToken, openaiApiKey, etc.) before DB storage.
 * Encrypted format: iv:authTag:ciphertext (base64, colon-separated)
 *
 * Requires: ENCRYPTION_KEY env var (exactly 32 characters)
 */
@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const rawKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!rawKey || rawKey.length !== 32) {
      throw new Error(
        'ENCRYPTION_KEY must be exactly 32 characters for AES-256-GCM.',
      );
    }
    this.key = Buffer.from(rawKey, 'utf8');
  }

  /**
   * Encrypt a plaintext string.
   * @returns Encrypted string in format "iv:authTag:ciphertext" (all base64)
   *          or null if input is null/undefined.
   */
  encrypt(plaintext: string | null | undefined): string | null {
    if (plaintext == null) return null;

    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted.toString('base64'),
    ].join(':');
  }

  /**
   * Decrypt an encrypted string produced by encrypt().
   * @returns Original plaintext, or null if input is null/empty.
   */
  decrypt(encrypted: string | null | undefined): string | null {
    if (!encrypted) return null;

    // Support plaintext values stored before encryption was introduced
    // (they won't contain ':' separators in base64 format as 3 parts)
    const parts = encrypted.split(':');
    if (parts.length !== 3) {
      // Likely a legacy plaintext value — return as-is (migration path)
      this.logger.warn(
        'decrypt() received a non-encrypted value. Returning as plaintext (legacy migration path).',
      );
      return encrypted;
    }

    try {
      const [ivB64, authTagB64, dataB64] = parts;
      const iv = Buffer.from(ivB64, 'base64');
      const authTag = Buffer.from(authTagB64, 'base64');
      const data = Buffer.from(dataB64, 'base64');

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      return Buffer.concat([decipher.update(data), decipher.final()]).toString(
        'utf8',
      );
    } catch (err: any) {
      this.logger.error(`Decryption failed: ${err.message}`);
      return null;
    }
  }
}
