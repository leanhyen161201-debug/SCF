import { Card, Empty } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Adjustment {
  previousLimit: number;
  newLimit: number;
  createdAt: string;
  reason: string;
}

interface LimitHistoryChartProps {
  adjustments: Adjustment[];
}

export default function LimitHistoryChart({ adjustments }: LimitHistoryChartProps) {
  if (!adjustments || adjustments.length === 0) {
    return (
      <Card title="Limit History">
        <Empty description="No adjustment history" />
      </Card>
    );
  }

  const chartData = adjustments
    .slice()
    .reverse()
    .map((adj) => ({
      date: new Date(adj.createdAt).toLocaleDateString('zh-CN'),
      limit: Number(adj.newLimit),
      reason: adj.reason,
    }));

  return (
    <Card title="Limit Adjustment History">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(value)
            }
          />
          <Line type="monotone" dataKey="limit" stroke="#1677ff" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
