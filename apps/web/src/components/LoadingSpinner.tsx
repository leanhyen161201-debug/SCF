import { Spin } from 'antd';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spin size="large" />
    </div>
  );
}
