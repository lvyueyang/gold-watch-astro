import { Edit } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleEdit = (wh: Webhook) => {
    setEditingWebhook(wh);
    setEditUrl(wh.url || "");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingWebhook) return;

    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: editingWebhook.key, url: editUrl }),
      });

      if (res.ok) {
        show({ title: "更新成功", variant: "default" });
        setIsModalOpen(false);
        fetchWebhooks();
      } else {
        const data = (await res.json()) as { error?: string };
        show({ title: data.error || "更新失败", variant: "destructive" });
      }
    } catch (_e) {
      show({ title: "请求出错", variant: "destructive" });
    }
  };

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
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => handleEdit(wh)}>
                  <Edit className="w-4 h-4 mr-1" />
                  配置
                </Button>
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
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((wh) => (
                <TableRow key={wh.key}>
                  <TableCell>
                    <Badge variant="outline">{wh.key}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeVariant(wh.type) as BadgeProps["variant"]}>
                      {getTypeLabel(wh.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={wh.configured ? "default" : "secondary"}>
                      {wh.configured ? "已配置" : "未配置"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {wh.url ? `${wh.url.substring(0, 30)}...` : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(wh)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {webhooks.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>配置通知渠道</DialogTitle>
            <DialogDescription>
              配置 {editingWebhook ? getTypeLabel(editingWebhook.type) : ""} ({editingWebhook?.key})
              的 Webhook 地址。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://..."
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
