import { Response } from 'express';

let counterState = 0;

export function generateId(prefix: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  counterState = (counterState + 1) % 10000;
  const seq = String(counterState).padStart(4, '0');
  return `${prefix}-${year}${month}${day}-${seq}`;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  pageSize: number
) {
  return res.status(200).json({
    success: true,
    data: {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(String(query.pageSize || '20'), 10)));
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip };
}

export function diffInDays(date1: Date, date2: Date): number {
  const diff = date1.getTime() - date2.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
