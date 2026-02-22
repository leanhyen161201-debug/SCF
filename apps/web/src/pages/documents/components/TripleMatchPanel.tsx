import { Card, Button, Descriptions, Tag, Space, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { MatchResult } from '@scf/shared';

interface TripleMatchPanelProps {
  matchResult?: MatchResult;
  onMatch?: () => void;
  loading?: boolean;
  canMatch?: boolean;
}

export default function TripleMatchPanel({
  matchResult,
  onMatch,
  loading,
  canMatch,
}: TripleMatchPanelProps) {
  if (!matchResult && !canMatch) return null;

  return (
    <Card title="Triple Document Match (Contract-Invoice-Logistics)" className="mt-4">
      {!matchResult && canMatch && (
        <div className="text-center py-4">
          <p className="mb-4 text-gray-500">
            All three documents (Contract, Invoice, Logistics) are available.
            Click to perform triple-match verification.
          </p>
          <Button type="primary" onClick={onMatch} loading={loading}>
            Run Triple Match
          </Button>
        </div>
      )}

      {matchResult && (
        <>
          <Alert
            type={matchResult.isMatched ? 'success' : 'error'}
            message={matchResult.isMatched ? 'Match Passed' : 'Match Failed'}
            description={matchResult.autoRejectReason || `Score: ${matchResult.score}/100`}
            showIcon
            className="mb-4"
          />

          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Overall Score">
              <Tag color={matchResult.score >= 80 ? 'green' : 'red'}>
                {matchResult.score.toFixed(1)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Result">
              {matchResult.isMatched ? (
                <Tag icon={<CheckCircleOutlined />} color="success">MATCHED</Tag>
              ) : (
                <Tag icon={<CloseCircleOutlined />} color="error">MISMATCHED</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Amount Match">
              <Space>
                {matchResult.details.amountMatch.passed ? (
                  <Tag color="green">PASS</Tag>
                ) : (
                  <Tag color="red">FAIL</Tag>
                )}
                Deviation: {(matchResult.details.amountMatch.deviation * 100).toFixed(2)}%
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Date Match">
              <Space>
                {matchResult.details.dateMatch.passed ? (
                  <Tag color="green">PASS</Tag>
                ) : (
                  <Tag color="red">FAIL</Tag>
                )}
                Diff: {matchResult.details.dateMatch.daysDiff.toFixed(0)} days
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Party Match">
              <Space>
                {matchResult.details.partyMatch.passed ? (
                  <Tag color="green">PASS</Tag>
                ) : (
                  <Tag color="red">FAIL</Tag>
                )}
                Similarity: {(matchResult.details.partyMatch.similarity * 100).toFixed(1)}%
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Goods Match">
              <Space>
                {matchResult.details.goodsMatch.passed ? (
                  <Tag color="green">PASS</Tag>
                ) : (
                  <Tag color="red">FAIL</Tag>
                )}
                Similarity: {(matchResult.details.goodsMatch.similarity * 100).toFixed(1)}%
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Card>
  );
}
