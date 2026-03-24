/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/require-await */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(workspaceId: string, data: any) {
    return this.prisma.order.create({
      data: {
        ...data,
        workspaceId,
      },
    });
  }

  async findAll(workspaceId: string) {
    return this.prisma.order.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: { contact: true },
    });
  }

  async findOne(workspaceId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        workspaceId,
      },
      include: { contact: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(workspaceId: string, id: string, data: any) {
    await this.findOne(workspaceId, id); // Ensure it exists and belongs to workspace

    return this.prisma.order.update({
      where: { id },
      data,
    });
  }

  async remove(workspaceId: string, id: string) {
    await this.findOne(workspaceId, id); // Ensure it exists and belongs to workspace

    return this.prisma.order.delete({
      where: { id },
    });
  }
}
