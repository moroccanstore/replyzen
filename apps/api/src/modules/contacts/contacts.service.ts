import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async listWorkspaceContacts(
    workspaceId: string,
    page = 1,
    limit = 50,
    search?: string,
  ) {
    const whereClause: Prisma.ContactWhereInput = { workspaceId };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.contact.count({ where: whereClause }),
    ]);

    return { contacts, total, page, limit };
  }

  async getOrAddContact(
    workspaceId: string,
    phoneNumber: string,
    name?: string,
  ) {
    let contact = await this.prisma.contact.findUnique({
      where: {
        workspaceId_phone: { workspaceId, phone: phoneNumber },
      },
    });

    if (!contact) {
      contact = await this.prisma.contact.create({
        data: {
          workspaceId,
          phone: phoneNumber,
          name: name || phoneNumber,
          customFields: {},
        },
      });
    }

    return contact;
  }
}
