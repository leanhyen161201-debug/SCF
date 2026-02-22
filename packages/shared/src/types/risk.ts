export enum RiskEventType {
  OVERDUE = 'OVERDUE',
  HIGH_RETURN_RATE = 'HIGH_RETURN_RATE',
  AMOUNT_MISMATCH = 'AMOUNT_MISMATCH',
  BLACKLIST_HIT = 'BLACKLIST_HIT',
  ABNORMAL_FLOW = 'ABNORMAL_FLOW',
}

export enum RiskSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum RiskEventStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  RESOLVED = 'RESOLVED',
  ESCALATED = 'ESCALATED',
}

export enum RiskAction {
  ALERT = 'ALERT',
  FREEZE = 'FREEZE',
  BLOCK = 'BLOCK',
  REJECT = 'REJECT',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
}

export interface RiskEvent {
  id: string;
  eventNo: string;
  enterpriseId: string;
  enterpriseName?: string;
  type: RiskEventType;
  severity: RiskSeverity;
  description: string;
  triggerRule: string;
  triggerValue: string;
  thresholdValue: string;
  action: RiskAction;
  status: RiskEventStatus;
  handledBy?: string;
  handledAt?: string;
  handleNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HandleRiskEventRequest {
  status: RiskEventStatus;
  handleNote?: string;
}

export interface RiskRule {
  id: string;
  name: string;
  code: string;
  description: string;
  type: RiskEventType;
  threshold: number;
  action: RiskAction;
  severity: RiskSeverity;
  isActive: boolean;
}
