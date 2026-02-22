// Credit limit calculation constants
export const BASE_AMOUNT = 100000; // Base credit amount: 100,000 CNY
export const VOLUME_REFERENCE = 500000; // Monthly volume benchmark: 500,000 CNY
export const FREQUENCY_REFERENCE = 100; // 90-day transaction count benchmark

// FlowScore weights
export const FLOW_WEIGHTS = {
  volume: 0.5,
  frequency: 0.3,
  growth: 0.2,
} as const;

// RiskMultiplier weights
export const RISK_WEIGHTS = {
  overdue: 0.4,
  returnRate: 0.3,
  latePayment: 0.3,
} as const;

// Hard red lines
export const OVERDUE_RATE_HARD_LIMIT = 0.05; // 5% overdue rate = no credit
export const RETURN_RATE_HARD_LIMIT = 0.15;  // 15% return rate = no credit

// Industry factors
export const INDUSTRY_FACTORS: Record<string, number> = {
  '电子商务': 1.1,
  '制造业': 1.0,
  '零售': 1.0,
  '物流': 0.95,
  '农业': 0.9,
  '建筑': 0.85,
  default: 1.0,
};

// Credit limit bounds
export const MIN_CREDIT_LIMIT = 10000;     // 10,000 CNY
export const MAX_CREDIT_LIMIT = 10000000;  // 10,000,000 CNY
