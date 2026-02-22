import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface DrilldownBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function DrilldownBreadcrumb({ items }: DrilldownBreadcrumbProps) {
  return (
    <Breadcrumb
      className="mb-4"
      items={[
        {
          title: (
            <Link to="/dashboard">
              <HomeOutlined /> Home
            </Link>
          ),
        },
        ...items.map((item, index) => ({
          title:
            index < items.length - 1 && item.path ? (
              <Link to={item.path}>{item.label}</Link>
            ) : (
              item.label
            ),
        })),
      ]}
    />
  );
}
