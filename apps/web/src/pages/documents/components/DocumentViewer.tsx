import { Card, Image, Typography, Empty } from 'antd';

interface DocumentViewerProps {
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
}

export default function DocumentViewer({ fileUrl, fileName, mimeType }: DocumentViewerProps) {
  if (!fileUrl) {
    return <Empty description="No document file available" />;
  }

  const isPdf = mimeType?.includes('pdf');
  const isImage = mimeType?.includes('image');

  return (
    <Card title={`Document: ${fileName || 'Unknown'}`}>
      {isImage && (
        <Image
          src={fileUrl}
          alt={fileName}
          style={{ maxWidth: '100%', maxHeight: 600 }}
        />
      )}
      {isPdf && (
        <iframe
          src={fileUrl}
          title={fileName}
          style={{ width: '100%', height: 600, border: 'none' }}
        />
      )}
      {!isImage && !isPdf && (
        <div className="text-center py-8">
          <Typography.Text type="secondary">
            Preview not available for this file type ({mimeType}).
          </Typography.Text>
          <br />
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            Download File
          </a>
        </div>
      )}
    </Card>
  );
}
