import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Plan } from '@prisma/client';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Processes Stripe webhook events to sync subscription status and workspace limits.
   */
  async handleStripeWebhook(event: any) {
    const { type, data } = event;
    const object = data.object;

    this.logger.log(`Processing Stripe event: ${type}`);

    switch (type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.syncSubscription(object);
        break;
      case 'customer.subscription.deleted':
        await this.cancelSubscription(object);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event type: ${type}`);
    }

    return { success: true };
  }

  private async syncSubscription(subscription: any) {
    const stripeId = subscription.id;
    const status = subscription.status;
    const workspaceId = subscription.metadata?.workspaceId;

    if (!workspaceId) {
      this.logger.error(
        `No workspaceId found in metadata for subscription ${stripeId}`,
      );
      return;
    }

    // Map Stripe product/price to our Plan enum
    // In a real app, you'd check subscription.items.data[0].price.id
    const plan = this.mapPriceToPlan(subscription.items?.data?.[0]?.price?.id);

    // Update Subscription record
    await this.prisma.subscription.upsert({
      where: { stripeId },
      create: {
        stripeId,
        workspaceId,
        plan,
        status,
        expiresAt: new Date(subscription.current_period_end * 1000),
      },
      update: {
        plan,
        status,
        expiresAt: new Date(subscription.current_period_end * 1000),
      },
    });

    // Update Workspace limits based on plan
    const limits = this.getPlanLimits(plan);
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        plan,
        aiWeeklyLimit: limits.aiWeeklyLimit,
        mediaMonthlyLimit: limits.mediaMonthlyLimit,
      },
    });

    this.logger.log(
      `Synced subscription ${stripeId} for workspace ${workspaceId} (Plan: ${plan})`,
    );
  }

  private async cancelSubscription(subscription: any) {
    const stripeId = subscription.id;

    const sub = await this.prisma.subscription.update({
      where: { stripeId },
      data: { status: 'canceled' },
    });

    // Revert workspace to FREE plan
    const freeLimits = this.getPlanLimits(Plan.FREE);
    await this.prisma.workspace.update({
      where: { id: sub.workspaceId },
      data: {
        plan: Plan.FREE,
        aiWeeklyLimit: freeLimits.aiWeeklyLimit,
        mediaMonthlyLimit: freeLimits.mediaMonthlyLimit,
      },
    });

    this.logger.log(
      `Canceled subscription ${stripeId} and reverted workspace ${sub.workspaceId} to FREE`,
    );
  }

  private mapPriceToPlan(priceId: string): Plan {
    // Placeholder mapping logic
    if (!priceId) return Plan.FREE;
    if (priceId.includes('pro')) return Plan.PRO;
    if (priceId.includes('starter')) return Plan.STARTER;
    if (priceId.includes('enterprise')) return Plan.ENTERPRISE;
    return Plan.STARTER;
  }

  private getPlanLimits(plan: Plan) {
    switch (plan) {
      case Plan.ENTERPRISE:
        return {
          aiWeeklyLimit: 10000,
          mediaMonthlyLimit: 10 * 1024 * 1024 * 1024,
        }; // 10GB
      case Plan.PRO:
        return {
          aiWeeklyLimit: 2000,
          mediaMonthlyLimit: 2 * 1024 * 1024 * 1024,
        }; // 2GB
      case Plan.STARTER:
        return { aiWeeklyLimit: 500, mediaMonthlyLimit: 500 * 1024 * 1024 }; // 500MB
      case Plan.FREE:
      default:
        return { aiWeeklyLimit: 100, mediaMonthlyLimit: 100 * 1024 * 1024 }; // 100MB
    }
  }
}
