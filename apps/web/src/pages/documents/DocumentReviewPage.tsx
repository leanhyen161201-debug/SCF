import { useParams } from 'react-router-dom';
import { Card, Descriptions, Button, Space, Typography, Spin } from 'antd';
import { useDocumentDetail, useExtractDocument, useMatchDocuments } from '@/hooks/useDocuments';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { DOCUMENT_STATUS_MAP, MATCH_STATUS_MAP, DOCUMENT_TYPE_MAP } from '@/utils/constants';
import { formatCurrency, formatDate } from '@/utils/format';
import TripleMatchPanel from './components/TripleMatchPanel';
import DrilldownBreadcrumb from '@/components/DrilldownBreadcrumb';

export default function DocumentReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useDocumentDetail(id!);
  const extractMutation = useExtractDocument();
  const matchMutation = useMatchDocuments();

  const doc = (data as any)?.data;

  if (isLoading) return <Spin size="large" className="flex justify-center mt-20" />;
  if (!doc) return <Typography.Text>Document not found</Typography.Text>;

  return (
    <div>
      <DrilldownBreadcrumb
        items={[
          { label: 'Documents', path: '/documents' },
          { label: doc.documentNo },
        ]}
      />

      <PageHeader
        title={`Document: ${doc.documentNo}`}
        extra={
          <Space>
            {doc.status === 'UPLOADED' && (
              <Button
                type="primary"
                onClick={() => extractMutation.mutate(doc.id)}
                loading={extractMutation.isPending}
              >
                Extract Fields
              </Button>
            )}
            <Button href={doc.fileUrl} target="_blank">
              View Original
            </Button>
          </Space>
        }
      />

      <Card className="mb-4">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Document No">{doc.documentNo}</Descriptions.Item>
          <Descriptions.Item label="Type">{DOCUMENT_TYPE_MAP[doc.type] || doc.type}</Descriptions.Item>
          <Descriptions.Item label="File Name">{doc.fileName}</Descriptions.Item>
          <Descriptions.Item label="File Size">{(doc.fileSize / 1024).toFixed(1)} KB</Descriptions.Item>
          <Descriptions.Item label="Status">
            <StatusBadge status={doc.status} statusMap={DOCUMENT_STATUS_MAP} />
          </Descriptions.Item>
          <Descriptions.Item label="Match Status">
            <StatusBadge status={doc.matchStatus} statusMap={MATCH_STATUS_MAP} />
          </Descriptions.Item>
          {doc.matchScore != null && (
            <Descriptions.Item label="Match Score">{doc.matchScore.toFixed(1)}</Descriptions.Item>
          )}
          <Descriptions.Item label="Created">{formatDate(doc.createdAt)}</Descriptions.Item>
        </Descriptions>
      </Card>

      {doc.extractedData && (
        <Card title="Extracted Fields" className="mb-4">
          <Descriptions bordered size="small" column={2}>
            {Object.entries(doc.extractedData as Record<string, string>).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {value}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      )}

      {doc.extractedAmount != null && (
        <Card title="Extracted Values" className="mb-4">
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="Amount">{formatCurrency(Number(doc.extractedAmount))}</Descriptions.Item>
            <Descriptions.Item label="Date">{formatDate(doc.extractedDate)}</Descriptions.Item>
            <Descriptions.Item label="Party A">{doc.extractedPartyA || '-'}</Descriptions.Item>
            <Descriptions.Item label="Party B">{doc.extractedPartyB || '-'}</Descriptions.Item>
            <Descriptions.Item label="Goods">{doc.extractedGoods || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {doc.matchResult && (
        <TripleMatchPanel matchResult={doc.matchResult} />
      )}
    </div>
  );
}
