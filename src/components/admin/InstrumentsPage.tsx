import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToastProvider, useToast } from '@/components/ui/toast';
import { RefreshCw } from 'lucide-react';
import AdminLayout from './AdminLayout';

interface Instrument {
  id: string;
  name: string;
  symbol: string;
  source: string;
  precision: number;
}

interface PriceData {
  price: number;
  ts: number;
}

const InstrumentsContent: React.FC = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [loading, setLoading] = useState(false);
  const [cronLoading, setCronLoading] = useState(false);
  const { show } = useToast();

  const handleCron = async () => {
    setCronLoading(true);
    try {
      const res = await fetch('/api/cron');
      if (res.ok) {
        show({ title: '手动触发监控成功', variant: 'default' });
        // Refresh prices after cron
        fetchPrices();
      } else {
        show({ title: '触发失败', variant: 'destructive' });
      }
    } catch (e) {
      show({ title: '请求出错', variant: 'destructive' });
    } finally {
      setCronLoading(false);
    }
  };

  const fetchInstruments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/instruments');
      const data = await res.json();
      setInstruments(Array.isArray(data) ? data : []);
    } catch (_error) {
      show({ title: '获取标的失败', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [show]);

  const fetchPrices = useCallback(async () => {
    if (instruments.length === 0) return;

    const newPrices: Record<string, PriceData> = {};
    await Promise.all(
      instruments.map(async (inst) => {
        try {
          const res = await fetch(`/api/price?instrumentId=${inst.id}`);
          if (res.ok) {
            const data = (await res.json()) as PriceData;
            newPrices[inst.id] = { price: data.price, ts: data.ts };
          }
        } catch (e) {
          console.error(`Failed to fetch price for ${inst.id}`, e);
        }
      }),
    );
    setPrices((prev) => ({ ...prev, ...newPrices }));
  }, [instruments]);

  useEffect(() => {
    fetchInstruments();
  }, [fetchInstruments]);

  useEffect(() => {
    if (instruments.length > 0) {
      fetchPrices();
      const interval = setInterval(fetchPrices, 10000); // Refresh every 10s
      return () => clearInterval(interval);
    }
  }, [instruments, fetchPrices]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">标的管理</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCron}
          disabled={cronLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${cronLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">立即检测</span>
        </Button>
      </div>

      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {instruments.map((inst) => (
          <Card
            key={inst.id}
            className="shadow-sm"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{inst.name}</CardTitle>
                  <CardDescription className="mt-1">{inst.symbol}</CardDescription>
                </div>
                <Badge variant="outline">{inst.source}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono">{inst.id}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">当前价格</span>
                  <span className="font-medium text-primary">
                    {prices[inst.id] ? `¥${prices[inst.id].price}` : '-'}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground">精度</span>
                  <span>{inst.precision}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {instruments.length === 0 && !loading && (
          <div className="text-center py-10 text-muted-foreground">暂无标的</div>
        )}
      </div>

      {/* Desktop View */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标的 ID</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>当前价格</TableHead>
                <TableHead>来源适配器</TableHead>
                <TableHead>精度</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instruments.map((inst) => (
                <TableRow key={inst.id}>
                  <TableCell className="font-medium">{inst.id}</TableCell>
                  <TableCell>{inst.name}</TableCell>
                  <TableCell>{inst.symbol}</TableCell>
                  <TableCell className="font-mono font-medium">
                    {prices[inst.id] ? `¥${prices[inst.id].price}` : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{inst.source}</Badge>
                  </TableCell>
                  <TableCell>{inst.precision}</TableCell>
                </TableRow>
              ))}
              {instruments.length === 0 && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-24 text-muted-foreground"
                  >
                    暂无标的
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

const InstrumentsPage: React.FC = () => {
  return (
    <ToastProvider>
      <AdminLayout selectedKey="instruments">
        <InstrumentsContent />
      </AdminLayout>
    </ToastProvider>
  );
};

export default InstrumentsPage;
