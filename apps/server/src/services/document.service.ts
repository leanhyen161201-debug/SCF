import { documentRepository } from '../repositories/document.repository';
import { NotFoundError } from '../utils/errors';
import { generateId } from '../utils/helpers';
import { DocumentType } from '@prisma/client';

export const documentService = {
  async list(page: number, pageSize: number, filters?: {
    type?: string;
    status?: string;
    orderId?: string;
    creditAppId?: string;
  }) {
    const skip = (page - 1) * pageSize;
    return documentRepository.findAll(skip, pageSize, filters as Parameters<typeof documentRepository.findAll>[2]);
  },

  async getById(id: string) {
    const doc = await documentRepository.findById(id);
    if (!doc) throw new NotFoundError('Document');
    return doc;
  },

  async upload(data: {
    type: DocumentType;
    orderId?: string;
    creditAppId?: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }) {
    return documentRepository.create({
      documentNo: generateId('DOC'),
      ...data,
    });
  },

  async getImage(id: string) {
    const doc = await documentRepository.findById(id);
    if (!doc) throw new NotFoundError('Document');
    return { filePath: doc.fileUrl, mimeType: doc.mimeType, fileName: doc.fileName };
  },
};
