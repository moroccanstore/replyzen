import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async evaluateKeywordRules(
    workspaceId: string,
    incomingMessage: string,
  ): Promise<string | null> {
    const rules = await this.prisma.automation.findMany({
      where: { workspaceId, isActive: true },
      orderBy: { priority: 'desc' }, // priority-based ordering
    });

    const lowerMessage = incomingMessage.toLowerCase();

    for (const rule of rules) {
      if (!rule.keywords || rule.keywords.length === 0) continue;

      const keywords = rule.keywords;

      const match = keywords.some((keyword) => {
        return lowerMessage.includes(keyword.toLowerCase());
      });

      if (match) {
        this.logger.log(
          `Rule matched: ${rule.id} for workspace ${workspaceId}`,
        );
        return rule.reply;
      }
    }

    return null; // No keyword match found
  }
}
