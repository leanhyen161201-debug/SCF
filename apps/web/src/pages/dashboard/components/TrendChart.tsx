import { Card } from 'antd';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TrendDataPoint {
  month: string;
  orders: number;
  credits: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
}

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <Card title="业务趋势" bodyStyle={{ padding: '12px 24px 24px' }}>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#1890ff" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#52c41a" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="orders"
            name="订单数"
            stroke="#1890ff"
            fillOpacity={1}
            fill="url(#colorOrders)"
          />
          <Area
            type="monotone"
            dataKey="credits"
            name="授信额度"
            stroke="#52c41a"
            fillOpacity={1}
            fill="url(#colorCredits)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
