import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AdminLayout from './AdminLayout';
import { ToastProvider, useToast } from '@/components/ui/toast';

interface Webhook {
  key: string;
  url: string | null;
  type: string;
  configured: boolean;
}

const WebhooksContent: React.FC = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

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
      show({ title: '获取通知渠道失败', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      feishu: '飞书',
      wecom: '企业微信',
      dingtalk: '钉钉'
    };
    return typeMap[type] || type.toUpperCase();
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'feishu': return 'success';
      case 'wecom': return 'info';
      case 'dingtalk': return 'warning';
      default: return 'default';
    }
  };

  const getMaskedUrl = (url: string | null) => {
    if (!url) return <span className="text-muted-foreground">-</span>;
    try {
      const urlObj = new URL(url);
      return `${urlObj.origin}${urlObj.pathname.substring(0, 15)}...`;
    } catch {
      return url.substring(0, 20) + '...';
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">通知渠道</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>渠道标识 (Key)</TableHead>
                <TableHead>平台类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>Webhook 地址 (已脱敏)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((wh) => (
                <TableRow key={wh.key}>
                  <TableCell>
                    <Badge variant="outline">{wh.key}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeVariant(wh.type) as any}>{getTypeLabel(wh.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={wh.configured ? "success" : "secondary"}>
                      {wh.configured ? '已配置' : '未配置'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {getMaskedUrl(wh.url)}
                  </TableCell>
                </TableRow>
              ))}
              {webhooks.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

const WebhooksPage: React.FC = () => {
  return (
    <ToastProvider>
      <AdminLayout selectedKey="webhooks">
        <WebhooksContent />
      </AdminLayout>
    </ToastProvider>
  );
};

export default WebhooksPage;
