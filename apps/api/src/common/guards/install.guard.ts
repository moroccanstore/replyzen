import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { InstallService } from '../../modules/install/install.service';
import { Request } from 'express';

@Injectable()
export class InstallGuard implements CanActivate {
  constructor(private readonly installService: InstallService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await Promise.resolve();
    const request = context.switchToHttp().getRequest<Request>();
    const isInstalled = await this.installService.isInstalled();
    const isInstallRoute = request.path.startsWith('/install');

    // 1. If not installed, only allow /install/* routes
    if (!isInstalled && !isInstallRoute) {
      // In a real API, we throw an error that the frontend handles by redirecting to /install
      // Returning false would result in ForbiddenException (403)
      throw new ForbiddenException(
        'Application not installed. Please visit /install.',
      );
    }

    // 2. If already installed, disable /install/* routes (security hardening)
    if (isInstalled && isInstallRoute) {
      // Allow /install/status for status checks, but block all write/configure routes
      if (request.path !== '/install/status') {
        throw new ForbiddenException('Application already installed.');
      }
    }

    return true;
  }
}
