import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Extract workspaceId from multiple possible locations
    const workspaceId =
      request.query.workspaceId ||
      request.params.workspaceId ||
      request.body.workspaceId ||
      request.headers['x-workspace-id'];

    if (!user) {
      return false;
    }

    if (!workspaceId) {
      throw new BadRequestException(
        'workspaceId is required for this resource',
      );
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: user.sub,
        workspaceId: workspaceId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    return true;
  }
}
