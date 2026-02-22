import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Space, Select, Input, Upload, Tag } from 'antd';
import {
  EyeOutlined,
  UploadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { useDocumentList, useUploadDocument } from '@/hooks/useDocuments';
import {
  DOCUMENT_STATUS_MAP,
  MATCH_STATUS_MAP,
  DOCUMENT_TYPE_MAP,
} from '@/utils/constants';
import { formatDateTime } from '@/utils/format';

interface DocumentRecord {
  id: string;
  documentNo: string;
  type: string;
  fileName: string;
  status: string;
  matchStatus: string;
  createdAt: string;
}

export default function DocumentListPage() {
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const { data, isLoading } = useDocumentList(filters);
  const uploadDocument = useUploadDocument();

  const list: DocumentRecord[] = (data as any)?.data ?? (data as any)?.list ?? [];
  const total: number = (data as any)?.total ?? list.length;

  const uploadProps: UploadProps = {
    showUploadList: false,
    beforeUpload: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      uploadDocument.mutate(formData);
      return false;
    },
  };

  const columns: ColumnsType<DocumentRecord> = [
    {
      title: '文档编号',
      dataIndex: 'documentNo',
      key: 'documentNo',
      width: 180,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <Tag>{DOCUMENT_TYPE_MAP[type] ?? type}</Tag>
      ),
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <StatusBadge status={status} statusMap={DOCUMENT_STATUS_MAP} />
      ),
    },
    {
      title: '匹配状态',
      dataIndex: 'matchStatus',
      key: 'matchStatus',
      width: 120,
      render: (status: string) => (
        <StatusBadge status={status} statusMap={MATCH_STATUS_MAP} />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => formatDateTime(date),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Link to={`/documents/${record.id}`}>
          <Button type="link" icon={<EyeOutlined />} size="small">
            查看
          </Button>
        </Link>
      ),
    },
  ];

  const handleSearch = (keyword: string) => {
    setFilters((prev) => ({ ...prev, keyword, page: 1 }));
  };

  const handleTypeFilter = (type: string | undefined) => {
    setFilters((prev) => ({ ...prev, type, page: 1 }));
  };

  const handleTableChange = (pagination: any) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  return (
    <div>
      <PageHeader
        title="单据管理"
        subtitle="管理合同、发票、物流单等单据"
        extra={
          <Upload {...uploadProps}>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              loading={uploadDocument.isPending}
            >
              上传文档
            </Button>
          </Upload>
        }
      />

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Input.Search
          placeholder="搜索文档编号或文件名"
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
          prefix={<SearchOutlined />}
        />
        <Select
          placeholder="文档类型"
          allowClear
          style={{ width: 160 }}
          onChange={handleTypeFilter}
          options={Object.entries(DOCUMENT_TYPE_MAP).map(([value, label]) => ({
            label,
            value,
          }))}
        />
      </div>

      <Table<DocumentRecord>
        columns={columns}
        dataSource={list}
        rowKey="id"
        loading={isLoading}
        onChange={handleTableChange}
        pagination={{
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => `共 ${t} 条`,
        }}
      />
    </div>
  );
}
