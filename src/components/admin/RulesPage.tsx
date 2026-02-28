import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import AdminLayout from './AdminLayout';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ToastProvider, useToast } from '@/components/ui/toast';

interface Rule {
  id: string;
  name: string;
  instrumentId: string;
  type: string;
  active: boolean;
  params: any;
  notify: any;
  state?: any;
}

interface Instrument {
  id: string;
  name: string;
}

interface Webhook {
  key: string;
  type: string;
  configured: boolean;
}

const RulesContent: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);
  const { show } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<any>({});

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rules');
      const data = await res.json();
      setRules(Array.isArray(data) ? data : []);
    } catch (error) {
      show({ title: '获取规则失败', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchInstruments = async () => {
    try {
      const res = await fetch('/api/instruments');
      const data = await res.json();
      setInstruments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch instruments');
    }
  };
  
  const fetchWebhooks = async () => {
    try {
      const res = await fetch('/api/webhooks');
      const data = await res.json();
      setWebhooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch webhooks');
    }
  };

  useEffect(() => {
    fetchRules();
    fetchInstruments();
    fetchWebhooks();
  }, []);

  const handleCreate = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      instrumentId: '',
      type: 'touch',
      active: true,
      target: '',
      lower: '',
      upper: '',
      notifyChannels: [],
      throttleMs: 600000
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: Rule) => {
    setEditingRule(record);
    setFormData({
      name: record.name,
      instrumentId: record.instrumentId,
      type: record.type,
      active: record.active,
      target: record.params.target || '',
      lower: record.params.lower || '',
      upper: record.params.upper || '',
      notifyChannels: record.notify.channels,
      throttleMs: record.notify.throttleMs,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除吗？')) return;
    try {
      await fetch(`/api/rules/${id}`, { method: 'DELETE' });
      show({ title: '规则已删除', variant: 'success' });
      fetchRules();
    } catch (error) {
      show({ title: '删除规则失败', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name || !formData.instrumentId) {
      show({ title: '请填写必要信息', variant: 'destructive' });
      return;
    }

    try {
      let params: any = {};
      if (formData.type === 'range') {
        params = { lower: Number(formData.lower), upper: Number(formData.upper) };
      } else {
        params = { target: Number(formData.target) };
      }
      
      const notify = {
        channels: formData.notifyChannels,
        throttleMs: Number(formData.throttleMs)
      };

      const payload = {
        name: formData.name,
        instrumentId: formData.instrumentId,
        type: formData.type,
        active: formData.active,
        params,
        notify,
      };

      if (editingRule) {
        await fetch(`/api/rules/${editingRule.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        show({ title: '规则更新成功', variant: 'success' });
      } else {
        await fetch('/api/rules', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        show({ title: '规则创建成功', variant: 'success' });
      }
      setIsModalOpen(false);
      fetchRules();
    } catch (error) {
      console.error(error);
      show({ title: '操作失败', variant: 'destructive' });
    }
  };

  const handleChannelChange = (channelKey: string, checked: boolean) => {
    const currentChannels = formData.notifyChannels || [];
    if (checked) {
      setFormData({ ...formData, notifyChannels: [...currentChannels, channelKey] });
    } else {
      setFormData({ ...formData, notifyChannels: currentChannels.filter((c: string) => c !== channelKey) });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">规则管理</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> 新建规则
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>规则名称</TableHead>
                <TableHead>标的</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>{rule.instrumentId}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{rule.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.active ? "success" : "secondary"}>
                      {rule.active ? "启用" : "禁用"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rules.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    暂无规则
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
            <DialogTitle>{editingRule ? '编辑规则' : '新建规则'}</DialogTitle>
            <DialogDescription>
              配置价格监控规则，当触发条件时发送通知。
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">规则名称</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="instrument">监控标的</Label>
              <Select 
                value={formData.instrumentId} 
                onValueChange={(val) => setFormData({...formData, instrumentId: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择标的" />
                </SelectTrigger>
                <SelectContent>
                  {instruments.map(inst => (
                    <SelectItem key={inst.id} value={inst.id}>{inst.name} ({inst.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">触发类型</Label>
              <Select 
                value={formData.type} 
                onValueChange={(val) => setFormData({...formData, type: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="touch">触达 (Touch)</SelectItem>
                  <SelectItem value="cross_up">上穿 (Cross Up)</SelectItem>
                  <SelectItem value="cross_down">下穿 (Cross Down)</SelectItem>
                  <SelectItem value="range">区间 (Range)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'range' ? (
              <div className="grid gap-2">
                <Label>价格区间</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="下限" 
                    value={formData.lower}
                    onChange={(e) => setFormData({...formData, lower: e.target.value})}
                  />
                  <span>-</span>
                  <Input 
                    type="number" 
                    placeholder="上限" 
                    value={formData.upper}
                    onChange={(e) => setFormData({...formData, upper: e.target.value})}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label>目标价格</Label>
                <Input 
                  type="number" 
                  placeholder="例如: 580.00" 
                  value={formData.target}
                  onChange={(e) => setFormData({...formData, target: e.target.value})}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label>通知渠道</Label>
              <div className="flex flex-col gap-2 border p-3 rounded-md">
                {webhooks.map(wh => (
                  <div key={wh.key} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`wh-${wh.key}`} 
                      checked={formData.notifyChannels?.includes(wh.key)}
                      onCheckedChange={(checked) => handleChannelChange(wh.key, checked as boolean)}
                      disabled={!wh.configured}
                    />
                    <label 
                      htmlFor={`wh-${wh.key}`} 
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${!wh.configured ? 'text-muted-foreground' : ''}`}
                    >
                      {wh.type} {!wh.configured && '(未配置)'}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>冷却时间 (毫秒)</Label>
              <Input 
                type="number" 
                value={formData.throttleMs}
                onChange={(e) => setFormData({...formData, throttleMs: e.target.value})}
                step={60000}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="active" 
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({...formData, active: checked})}
              />
              <Label htmlFor="active">启用规则</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const RulesPage: React.FC = () => {
  return (
    <ToastProvider>
      <AdminLayout selectedKey="rules">
        <RulesContent />
      </AdminLayout>
    </ToastProvider>
  );
};

export default RulesPage;
