import { prisma } from './base.repository';
import { DocumentType, DocumentStatus, MatchStatus } from '@prisma/client';

export const documentRepository = {
  async findAll(skip: number, take: number, filters?: {
    type?: DocumentType;
    status?: DocumentStatus;
    orderId?: string;
    creditAppId?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.orderId) where.orderId = filters.orderId;
    if (filters?.creditAppId) where.creditAppId = filters.creditAppId;

    const [items, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.document.count({ where }),
    ]);
    return { items, total };
  },

  async findById(id: string) {
    return prisma.document.findUnique({ where: { id } });
  },

  async create(data: {
    documentNo: string;
    type: DocumentType;
    orderId?: string;
    creditAppId?: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }) {
    return prisma.document.create({ data });
  },

  async updateExtractedData(id: string, data: {
    extractedData: Record<string, unknown>;
    extractedAmount?: number;
    extractedDate?: Date;
    extractedPartyA?: string;
    extractedPartyB?: string;
    extractedGoods?: string;
    status: DocumentStatus;
  }) {
    return prisma.document.update({
      where: { id },
      data: {
        ...data,
        extractedAmount: data.extractedAmount,
      },
    });
  },

  async updateMatchResult(id: string, data: {
    matchStatus: MatchStatus;
    matchResult: Record<string, unknown>;
    matchScore: number;
  }) {
    return prisma.document.update({ where: { id }, data });
  },

  async updateStatus(id: string, status: DocumentStatus) {
    return prisma.document.update({ where: { id }, data: { status } });
  },

  async findByOrderAndType(orderId: string, type: DocumentType) {
    return prisma.document.findFirst({ where: { orderId, type } });
  },
};
