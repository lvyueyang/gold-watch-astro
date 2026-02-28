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
import AdminLayout from "./AdminLayout";

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

  const fetchInstruments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/instruments");
      const data = await res.json();
      setInstruments(Array.isArray(data) ? data : []);
    } catch (_error) {
      show({ title: "获取标的失败", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    fetchInstruments();
  }, [fetchInstruments]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">标的管理</h1>
      </div>

      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {instruments.map((inst) => (
          <Card key={inst.id} className="shadow-sm">
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
