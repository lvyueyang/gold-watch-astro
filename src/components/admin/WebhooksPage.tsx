import React, { useEffect, useState } from 'react';
import { Table, Tag, message } from 'antd';
import AdminLayout from './AdminLayout';

interface Webhook {
  key: string;
  url: string | null;
  type: string;
  configured: boolean;
}

const WebhooksPage: React.FC = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webhooks');
      const data = await res.json();
      if (Array.isArray(data)) {
        setWebhooks(data);
      } else {
        setWebhooks([]);
      }
    } catch (error) {
      console.error(error);
      message.error('获取通知渠道失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const columns = [
    { 
      title: '渠道标识 (Key)', 
      dataIndex: 'key', 
      key: 'key',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    { 
      title: '平台类型', 
      dataIndex: 'type', 
      key: 'type',
      render: (text: string) => {
        const typeMap: Record<string, string> = {
          feishu: '飞书',
          wecom: '企业微信',
          dingtalk: '钉钉'
        };
        const color = text === 'feishu' ? 'green' : text === 'wecom' ? 'blue' : 'orange';
        return <Tag color={color}>{typeMap[text] || text.toUpperCase()}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'configured',
      key: 'configured',
      render: (configured: boolean) => (
        <Tag color={configured ? 'success' : 'default'}>
          {configured ? '已配置' : '未配置'}
        </Tag>
      )
    },
    { 
      title: 'Webhook 地址 (已脱敏)', 
      dataIndex: 'url', 
      key: 'url',
      render: (text: string | null) => {
        if (!text) return <span style={{ color: '#ccc' }}>-</span>;
        // Mask the URL for security
        try {
          const urlObj = new URL(text);
          return `${urlObj.origin}${urlObj.pathname.substring(0, 15)}...`;
        } catch {
          return text.substring(0, 20) + '...';
        }
      }
    },
  ];

  return (
    <AdminLayout selectedKey="webhooks">
      <Table 
        dataSource={webhooks} 
        columns={columns} 
        rowKey="key" 
        loading={loading} 
        pagination={false}
      />
    </AdminLayout>
  );
};

export default WebhooksPage;
