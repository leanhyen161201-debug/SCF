import { Upload, Button, Select, Form, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useUploadDocument } from '@/hooks/useDocuments';

interface DocumentUploadProps {
  orderId?: string;
  creditAppId?: string;
  onSuccess?: () => void;
}

export default function DocumentUpload({ orderId, creditAppId, onSuccess }: DocumentUploadProps) {
  const [form] = Form.useForm();
  const uploadMutation = useUploadDocument();

  const handleUpload = (info: any) => {
    const type = form.getFieldValue('type');
    if (!type) {
      message.warning('Please select document type first');
      return;
    }

    const formData = new FormData();
    formData.append('file', info.file);
    formData.append('type', type);
    if (orderId) formData.append('orderId', orderId);
    if (creditAppId) formData.append('creditAppId', creditAppId);

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  return (
    <Form form={form} layout="inline">
      <Form.Item name="type" rules={[{ required: true, message: 'Select type' }]}>
        <Select placeholder="Document type" style={{ width: 140 }}>
          <Select.Option value="CONTRACT">Contract</Select.Option>
          <Select.Option value="INVOICE">Invoice</Select.Option>
          <Select.Option value="LOGISTICS_BILL">Logistics</Select.Option>
          <Select.Option value="OTHER">Other</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Upload
          customRequest={handleUpload}
          showUploadList={false}
          accept=".pdf,.jpg,.jpeg,.png"
        >
          <Button icon={<UploadOutlined />} loading={uploadMutation.isPending}>
            Upload Document
          </Button>
        </Upload>
      </Form.Item>
    </Form>
  );
}
