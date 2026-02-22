export enum DocumentType {
  CONTRACT = 'CONTRACT',
  INVOICE = 'INVOICE',
  LOGISTICS_BILL = 'LOGISTICS_BILL',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  UPLOADED = 'UPLOADED',
  EXTRACTING = 'EXTRACTING',
  EXTRACTED = 'EXTRACTED',
  REVIEWING = 'REVIEWING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum MatchStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  MISMATCHED = 'MISMATCHED',
  PARTIAL = 'PARTIAL',
}

export interface Document {
  id: string;
  documentNo: string;
  type: DocumentType;
  orderId?: string;
  creditAppId?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  extractedData?: ExtractedData;
  extractedAmount?: number;
  extractedDate?: string;
  extractedPartyA?: string;
  extractedPartyB?: string;
  extractedGoods?: string;
  matchStatus: MatchStatus;
  matchResult?: MatchResult;
  matchScore?: number;
  status: DocumentStatus;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedData {
  amount?: string;
  date?: string;
  partyA?: string;
  partyB?: string;
  goods?: string;
  quantity?: string;
  invoiceNo?: string;
  contractNo?: string;
  waybillNo?: string;
  [key: string]: string | undefined;
}

export interface CleanedDocumentData {
  amount: number;
  date: Date;
  partyA: string;
  partyB: string;
  goods: string[];
  quantity: number;
}

export interface MatchResult {
  isMatched: boolean;
  score: number;
  details: {
    amountMatch: { passed: boolean; deviation: number };
    dateMatch: { passed: boolean; daysDiff: number };
    partyMatch: { passed: boolean; similarity: number };
    goodsMatch: { passed: boolean; similarity: number };
  };
  autoRejectReason?: string;
}

export interface TripleMatchRequest {
  contractId: string;
  invoiceId: string;
  logisticsId: string;
  orderId?: string;
}
