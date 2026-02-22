import { Modal, Form, InputNumber, Input } from 'antd';
import { useAdjustLimit } from '@/hooks/useLimit';

interface LimitAdjustFormProps {
  open: boolean;
  onClose: () => void;
  enterpriseId: string;
  currentLimit: number;
}

export default function LimitAdjustForm({ open, onClose, enterpriseId, currentLimit }: LimitAdjustFormProps) {
  const [form] = Form.useForm();
  const adjustMutation = useAdjustLimit();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      adjustMutation.mutate(
        { enterpriseId, ...values },
        {
          onSuccess: () => {
            form.resetFields();
            onClose();
          },
        }
      );
    } catch {
      // validation failed
    }
  };

  return (
    <Modal
      title="Adjust Credit Limit"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={adjustMutation.isPending}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Current Limit">
          <InputNumber
            value={currentLimit}
            disabled
            style={{ width: '100%' }}
            formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        </Form.Item>
        <Form.Item
          name="newLimit"
          label="New Limit"
          rules={[{ required: true, message: 'Please enter new limit' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={10000}
            formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/¥\s?|(,*)/g, '') as unknown as number}
          />
        </Form.Item>
        <Form.Item
          name="reason"
          label="Reason"
          rules={[{ required: true, message: 'Please enter reason' }]}
        >
          <Input.TextArea rows={3} placeholder="Reason for adjustment" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
