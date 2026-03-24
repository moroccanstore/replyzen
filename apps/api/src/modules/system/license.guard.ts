import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { LicenseService } from './license.service';

@Injectable()
export class LicenseGuard implements CanActivate {
  constructor(private readonly licenseService: LicenseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip license check for certain routes if needed (e.g., /health, /install)
    const request = context.switchToHttp().getRequest();
    if (
      request.url.startsWith('/install') ||
      request.url.startsWith('/license/activate')
    ) {
      return true;
    }

    const isValid = await this.licenseService.isLicenseValid();
    if (!isValid) {
      throw new ForbiddenException({
        error: 'LICENSE_INVALID',
        message:
          'Your license is invalid or has been revoked. Please activate a valid purchase code.',
      });
    }

    return true;
  }
}
