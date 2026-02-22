import type { CreditStatus, OrderStatus, RiskSeverity, RiskEventStatus, DocumentStatus, MatchStatus } from '@scf/shared';

export const CREDIT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待审核', color: 'gold' },
  UNDER_REVIEW: { label: '审核中', color: 'processing' },
  APPROVED: { label: '已通过', color: 'success' },
  REJECTED: { label: '已驳回', color: 'error' },
  CANCELLED: { label: '已取消', color: 'default' },
};

export const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  CREATED: { label: '已创建', color: 'default' },
  CONFIRMED: { label: '已确认', color: 'processing' },
  SHIPPED: { label: '已发货', color: 'cyan' },
  DELIVERED: { label: '已送达', color: 'blue' },
  COMPLETED: { label: '已完成', color: 'success' },
  RETURNED: { label: '已退货', color: 'error' },
  CANCELLED: { label: '已取消', color: 'default' },
};

export const RISK_SEVERITY_MAP: Record<string, { label: string; color: string }> = {
  LOW: { label: '低', color: 'green' },
  MEDIUM: { label: '中', color: 'gold' },
  HIGH: { label: '高', color: 'orange' },
  CRITICAL: { label: '严重', color: 'red' },
};

export const RISK_EVENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待处理', color: 'gold' },
  PROCESSING: { label: '处理中', color: 'processing' },
  RESOLVED: { label: '已处理', color: 'success' },
  ESCALATED: { label: '已升级', color: 'error' },
};

export const DOCUMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  UPLOADED: { label: '已上传', color: 'default' },
  EXTRACTING: { label: '提取中', color: 'processing' },
  EXTRACTED: { label: '已提取', color: 'blue' },
  REVIEWING: { label: '审核中', color: 'gold' },
  APPROVED: { label: '已通过', color: 'success' },
  REJECTED: { label: '已驳回', color: 'error' },
};

export const MATCH_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待匹配', color: 'default' },
  MATCHED: { label: '匹配成功', color: 'success' },
  MISMATCHED: { label: '不匹配', color: 'error' },
  PARTIAL: { label: '部分匹配', color: 'gold' },
};

export const DOCUMENT_TYPE_MAP: Record<string, string> = {
  CONTRACT: '合同',
  INVOICE: '发票',
  LOGISTICS_BILL: '物流单',
  OTHER: '其他',
};
