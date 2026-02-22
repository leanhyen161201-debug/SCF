import { Steps } from 'antd';
import { ORDER_STATUS_MAP } from '@/utils/constants';

const STATUS_ORDER = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED'];

interface OrderStatusTimelineProps {
  currentStatus: string;
}

export default function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const isTerminal = ['RETURNED', 'CANCELLED'].includes(currentStatus);

  const items = STATUS_ORDER.map((status) => ({
    title: ORDER_STATUS_MAP[status]?.label || status,
  }));

  if (isTerminal) {
    items.push({
      title: ORDER_STATUS_MAP[currentStatus]?.label || currentStatus,
    });
  }

  return (
    <Steps
      current={isTerminal ? items.length - 1 : currentIndex}
      status={isTerminal ? 'error' : 'process'}
      items={items}
      size="small"
    />
  );
}
