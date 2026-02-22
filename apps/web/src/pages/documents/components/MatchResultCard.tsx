import { Card, Tag, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { MATCH_STATUS_MAP } from '@/utils/constants';

interface MatchResultCardProps {
  matchStatus: string;
  matchScore?: number;
}

export default function MatchResultCard({ matchStatus, matchScore }: MatchResultCardProps) {
  const config = MATCH_STATUS_MAP[matchStatus] || { label: matchStatus, color: 'default' };

  const icon = matchStatus === 'MATCHED'
    ? <CheckCircleOutlined />
    : matchStatus === 'MISMATCHED'
    ? <CloseCircleOutlined />
    : <ClockCircleOutlined />;

  return (
    <Card size="small" className="mt-2">
      <div className="flex items-center justify-between">
        <div>
          <Typography.Text strong>Match Status: </Typography.Text>
          <Tag icon={icon} color={config.color}>
            {config.label}
          </Tag>
        </div>
        {matchScore !== undefined && (
          <Typography.Text>
            Score: <Typography.Text strong>{matchScore.toFixed(1)}</Typography.Text>/100
          </Typography.Text>
        )}
      </div>
    </Card>
  );
}
