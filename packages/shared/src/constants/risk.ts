// Triple-match amount threshold (epsilon)
export const AMOUNT_MATCH_THRESHOLD = 0.01; // 1%

// Return rate threshold for blocking
export const RETURN_RATE_THRESHOLD = 0.15; // 15%

// Overdue days threshold for freezing
export const OVERDUE_FREEZE_DAYS = 1;

// Match score weights
export const MATCH_WEIGHTS = {
  amount: 0.4,
  date: 0.2,
  party: 0.2,
  goods: 0.2,
} as const;

// Match passing score threshold
export const MATCH_PASS_SCORE = 80;

// Risk rule codes
export const RISK_RULES = {
  OVERDUE_1DAY_FREEZE: 'OVERDUE_1DAY_FREEZE',
  RETURN_RATE_15_BLOCK: 'RETURN_RATE_15_BLOCK',
  AMOUNT_MISMATCH_REJECT: 'AMOUNT_MISMATCH_REJECT',
} as const;
