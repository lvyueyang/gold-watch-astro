import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AdminLayout from './AdminLayout';
import { ToastProvider, useToast } from '@/components/ui/toast';

interface Instrument {
  id: string;
  name: string;
  symbol: string;
  source: string;
  precision: number;
}

const InstrumentsContent: React.FC = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  const fetchInstruments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/instruments');
      const data = await res.json();
      setInstruments(Array.isArray(data) ? data : []);
    } catch (error) {
      show({ title: '获取标的失败', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstruments();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">标的管理</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标的 ID</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>Symbol</TableHead>
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
                  <TableCell>
                    <Badge variant="outline">{inst.source}</Badge>
                  </TableCell>
                  <TableCell>{inst.precision}</TableCell>
                </TableRow>
              ))}
              {instruments.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
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
