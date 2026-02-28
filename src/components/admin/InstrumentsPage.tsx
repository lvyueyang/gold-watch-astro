import React, { useEffect, useState } from 'react';
import { Table, Tag, message, Button, Modal, Form, Input, InputNumber, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminLayout from './AdminLayout';

interface Instrument {
  id: string;
  name: string;
  symbol: string;
  source: string;
  precision: number;
}

const InstrumentsPage: React.FC = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchInstruments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/instruments');
      const data = await res.json();
      setInstruments(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('获取标的失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstruments();
  }, []);

  const handleCreate = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    // Currently API only supports GET, so this is just a mockup for future implementation
    message.info('标的由代码中的适配器定义，不支持动态添加');
    setIsModalOpen(false);
  };

  const columns = [
    { title: '标的 ID', dataIndex: 'id', key: 'id' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: 'Symbol', dataIndex: 'symbol', key: 'symbol' },
    { 
      title: '来源适配器', 
      dataIndex: 'source', 
      key: 'source',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    { title: '精度', dataIndex: 'precision', key: 'precision' },
  ];

  return (
    <AdminLayout selectedKey="instruments">
      <div style={{ marginBottom: 16 }}>
        <Button disabled icon={<PlusOutlined />} onClick={handleCreate}>
          添加标的 (代码定义)
        </Button>
      </div>
      <Table 
        dataSource={instruments} 
        columns={columns} 
        rowKey="id" 
        loading={loading} 
        pagination={false}
      />

      <Modal title="添加标的" open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="id" label="ID" rules={[{ required: true }]}>
            <Input placeholder="XAU-CN" />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="工行积存金" />
          </Form.Item>
          <Form.Item name="source" label="来源">
             <Select defaultValue="icbc">
               <Select.Option value="icbc">ICBC</Select.Option>
               <Select.Option value="binance">Binance</Select.Option>
             </Select>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default InstrumentsPage;
