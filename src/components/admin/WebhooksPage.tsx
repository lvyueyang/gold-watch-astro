import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { getTypeLabel, getTypeVariant } from "@/lib/webhook-utils";
import AdminLayout from "./AdminLayout";

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

  const fetchWebhooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/webhooks");
      const data = await res.json();
      if (Array.isArray(data)) {
        setWebhooks(data);
      } else {
        setWebhooks([]);
      }
    } catch (_error) {
      show({ title: "获取通知渠道失败", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const _getMaskedUrl = (url: string | null) => {
    if (!url) return <span className="text-muted-foreground">-</span>;
    try {
      const urlObj = new URL(url);
      return `${urlObj.origin}${urlObj.pathname.substring(0, 15)}...`;
    } catch {
      return `${url.substring(0, 20)}...`;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">通知渠道</h1>
      </div>

      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {webhooks.map((wh) => (
          <Card key={wh.key} className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{getTypeLabel(wh.type)}</CardTitle>
                <Badge variant={wh.configured ? "default" : "secondary"}>
                  {wh.configured ? "已配置" : "未配置"}
                </Badge>
              </div>
              <CardDescription>{wh.key}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono text-muted-foreground break-all bg-muted p-2 rounded">
                {wh.url ? wh.url : "未配置 Webhook URL"}
              </div>
            </CardContent>
          </Card>
        ))}
        {webhooks.length === 0 && !loading && (
          <div className="text-center py-10 text-muted-foreground">暂无数据</div>
        )}
      </div>

      {/* Desktop View */}
      <Card className="hidden md:block">
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
                    <Badge variant={wh.configured ? "default" : "secondary"}>
                      {wh.configured ? "已配置" : "未配置"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {wh.url ? `${wh.url.substring(0, 30)}...` : "-"}
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
