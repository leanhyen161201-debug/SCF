export enum CreditStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface CreditApplication {
  id: string;
  applicationNo: string;
  enterpriseId: string;
  enterpriseName?: string;
  requestedAmount: number;
  approvedAmount?: number;
  status: CreditStatus;
  riskScore?: number;
  reviewerId?: string;
  reviewNote?: string;
  submittedAt: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreditRequest {
  enterpriseId: string;
  requestedAmount: number;
}

export interface ReviewCreditRequest {
  status: CreditStatus.APPROVED | CreditStatus.REJECTED;
  approvedAmount?: number;
  reviewNote?: string;
}
