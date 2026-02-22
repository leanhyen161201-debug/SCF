export enum OrderStatus {
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
}

export enum FinancingStatus {
  NONE = 'NONE',
  APPLIED = 'APPLIED',
  APPROVED = 'APPROVED',
  DISBURSED = 'DISBURSED',
  REPAID = 'REPAID',
  OVERDUE = 'OVERDUE',
}

export interface Order {
  id: string;
  orderNo: string;
  enterpriseId: string;
  enterpriseName?: string;
  amount: number;
  status: OrderStatus;
  financingAmount?: number;
  financingStatus?: FinancingStatus;
  dueDate?: string;
  repaidAt?: string;
  overdueDays: number;
  isReturned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  enterpriseId: string;
  amount: number;
  dueDate?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.CREATED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
  [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.RETURNED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.RETURNED]: [],
  [OrderStatus.CANCELLED]: [],
};
