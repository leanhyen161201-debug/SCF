export * from './user';
export * from './credit';
export * from './order';
export * from './document';
export * from './risk';
export * from './dashboard';

// Common API types
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  code?: string;
  details?: unknown;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Enterprise {
  id: string;
  name: string;
  unifiedCode: string;
  contactPerson: string;
  contactPhone: string;
  address?: string;
  industry?: string;
  registeredCapital?: number;
  status: EnterpriseStatus;
  createdAt: string;
  updatedAt: string;
}

export enum EnterpriseStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  BLACKLISTED = 'BLACKLISTED',
}

export interface CreditLimit {
  id: string;
  enterpriseId: string;
  enterpriseName?: string;
  totalLimit: number;
  usedLimit: number;
  availableLimit: number;
  suggestedLimit?: number;
  algorithm?: string;
  calculationData?: FlowAnalysis;
  lastCalculatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlowAnalysis {
  avgMonthlyVolume: number;
  transactionCount: number;
  growthRate: number;
  overdueRate: number;
  returnRate: number;
  latePaymentRatio: number;
}

export interface LimitAdjustment {
  id: string;
  creditLimitId: string;
  previousLimit: number;
  newLimit: number;
  reason: string;
  adjustedBy: string;
  createdAt: string;
}

export interface AdjustLimitRequest {
  newLimit: number;
  reason: string;
}

export interface EcommerceFlow {
  id: string;
  enterpriseId: string;
  platform: string;
  transactionDate: string;
  amount: number;
  transactionType: string;
  orderRef?: string;
  syncedAt: string;
}
