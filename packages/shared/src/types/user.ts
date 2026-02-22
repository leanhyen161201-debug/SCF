export enum UserRole {
  ADMIN = 'ADMIN',
  RISK_MANAGER = 'RISK_MANAGER',
  CREDIT_OFFICER = 'CREDIT_OFFICER',
  OPERATOR = 'OPERATOR',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  DISABLED = 'DISABLED',
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['*'],
  [UserRole.RISK_MANAGER]: [
    'dashboard:read',
    'credit:read', 'credit:review',
    'order:read',
    'document:read', 'document:review',
    'risk:read', 'risk:manage',
    'limit:read', 'limit:manage',
  ],
  [UserRole.CREDIT_OFFICER]: [
    'dashboard:read',
    'credit:read', 'credit:create', 'credit:update', 'credit:review',
    'order:read',
    'document:read', 'document:create',
    'risk:read',
    'limit:read',
  ],
  [UserRole.OPERATOR]: [
    'dashboard:read',
    'order:read', 'order:create', 'order:update',
    'document:read', 'document:create',
    'risk:read',
  ],
};
