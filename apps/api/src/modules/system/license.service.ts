import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface LicenseData {
  licenseKey: string;
  status: string;
  message?: string;
}

@Injectable()
export class LicenseService implements OnModuleInit {
  private readonly logger = new Logger(LicenseService.name);
  private readonly licenseFilePath = path.join(process.cwd(), 'license.lock');
  private isValid = true;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.checkLicense();
    // Run validation every 12 hours
    setInterval(() => {
      this.checkLicense().catch((err) => {
        this.logger.error(`Scheduled license check failed: ${err.message}`);
      });
    }, 12 * 60 * 60 * 1000);
  }

  /**
   * Checks the local license against the remote server.
   */
  async checkLicense() {
    try {
      if (!fs.existsSync(this.licenseFilePath)) {
        this.isValid = false;
        return;
      }

      const fileContent = fs.readFileSync(this.licenseFilePath, 'utf8');
      const licenseData = JSON.parse(fileContent) as LicenseData;
      const licenseServerUrl = this.configService.get<string>('LICENSE_SERVER_URL') || 'http://localhost:3001';
      const domain = this.configService.get<string>('APP_DOMAIN') || 'localhost';

      const response = await axios.post<{ status: string }>(
        `${licenseServerUrl}/license/validate`,
        {
          licenseKey: licenseData.licenseKey,
          domain,
        },
        { timeout: 10000 },
      );

      this.isValid = response.data.status === 'valid';

      if (!this.isValid) {
        this.logger.error('CRITICAL: License is invalid or revoked. System features blocked.');
      } else {
        this.logger.log('License validated successfully.');
      }
    } catch (error: any) {
      this.logger.error(`License validation failed: ${error.message}.`);
      // For production hardening, we only allow offline usage if we have a valid cache,
      // but here we'll default to invalid if the server check fails to prevent spoofing.
      this.isValid = false;
    }
  }

  /**
   * Activates a new license via purchase code.
   */
  async activate(purchaseCode: string) {
    try {
      const licenseServerUrl = this.configService.get<string>('LICENSE_SERVER_URL') || 'http://localhost:3001';
      const domain = this.configService.get<string>('APP_DOMAIN') || 'localhost';

      const response = await axios.post<LicenseData>(
        `${licenseServerUrl}/license/activate`,
        {
          purchaseCode,
          domain,
        },
        { timeout: 15000 },
      );

      if (response.data.status === 'success') {
        fs.writeFileSync(this.licenseFilePath, JSON.stringify(response.data, null, 2));
        this.isValid = true;
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error: any) {
      const message = error.response?.data?.message || (error as Error).message;
      return { success: false, message };
    }
  }

  isLicenseValid(): boolean {
    return this.isValid;
  }
}
