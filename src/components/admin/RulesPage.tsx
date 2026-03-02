import { useForm } from '@tanstack/react-form';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Bell, Clock, Edit, Plus, RotateCcw, Target, Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToastProvider, useToast } from '@/components/ui/toast';
import { getTypeLabel } from '@/lib/webhook-utils';
import AdminLayout from './AdminLayout';

interface RuleParams {
  target?: number;
  lower?: number;
  upper?: number;
}

interface RuleNotify {
  channels: string[];
  throttleMs: number;
}

interface Rule {
  id: string;
  name: string;
  instrumentId: string;
  type: string;
  active: boolean;
  params: RuleParams;
  notify: RuleNotify;
  state?: unknown;
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

const queryClient = new QueryClient();

const RulesContent: React.FC = () => {
  const { show } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  // Dialog States
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Queries
  const { data: rules = [], isLoading: rulesLoading } = useQuery<Rule[]>({
    queryKey: ['rules'],
    queryFn: async () => {
      const res = await fetch('/api/rules');
      return await res.json();
    },
  });

  const { data: instruments = [] } = useQuery<Instrument[]>({
    queryKey: ['instruments'],
    queryFn: async () => {
      const res = await fetch('/api/instruments');
      return await res.json();
    },
  });

  const { data: webhooks = [] } = useQuery<Webhook[]>({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const res = await fetch('/api/webhooks');
      return await res.json();
    },
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/rules/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      show({ title: '规则已删除', variant: 'success' });
    },
    onError: () => {
      show({ title: '删除规则失败', variant: 'destructive' });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/rules/${id}/reset`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      show({ title: '规则状态已重置', variant: 'success' });
    },
    onError: () => {
      show({ title: '重置失败', variant: 'destructive' });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Omit<Rule, 'id'> & { id?: string }) => {
      const { id, ...payload } = data;
      if (id) {
        await fetch(`/api/rules/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/rules', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      show({
        title: variables.id ? '规则更新成功' : '规则创建成功',
        variant: 'success',
      });
      setIsModalOpen(false);
    },
    onError: () => {
      show({ title: '操作失败', variant: 'destructive' });
    },
  });

  // Form
  const form = useForm({
    defaultValues: {
      name: '',
      instrumentId: '',
      type: 'touch',
      active: true,
      target: '',
      lower: '',
      upper: '',
      notifyChannels: [] as string[],
      throttleMs: 600000,
    },
    onSubmit: async ({ value }) => {
      let params: RuleParams = {};
      if (value.type === 'range') {
        params = { lower: Number(value.lower), upper: Number(value.upper) };
      } else {
        params = { target: Number(value.target) };
      }

      const notify = {
        channels: value.notifyChannels,
        throttleMs: Number(value.throttleMs),
      };

      const payload = {
        id: editingRule?.id, // undefined for create
        name: value.name,
        instrumentId: value.instrumentId,
        type: value.type,
        active: value.active,
        params,
        notify,
      };

      await saveMutation.mutateAsync(payload);
    },
  });

  const handleCreate = () => {
    setEditingRule(null);
    form.reset();
    // Set default instrument if available
    if (instruments.length > 0) {
      form.setFieldValue('instrumentId', instruments[0].id);
    }
    setIsModalOpen(true);
  };

  const handleEdit = (record: Rule) => {
    setEditingRule(record);
    form.reset();
    // Populate form
    form.setFieldValue('name', record.name);
    form.setFieldValue('instrumentId', record.instrumentId);
    form.setFieldValue('type', record.type);
    form.setFieldValue('active', record.active);
    form.setFieldValue('target', String(record.params.target || ''));
    form.setFieldValue('lower', String(record.params.lower || ''));
    form.setFieldValue('upper', String(record.params.upper || ''));
    form.setFieldValue('notifyChannels', record.notify.channels || []);
    form.setFieldValue('throttleMs', record.notify.throttleMs || 600000);

    setIsModalOpen(true);
  };

  const handleReset = (id: string) => {
    setSelectedRuleId(id);
    setResetDialogOpen(true);
  };

  const confirmReset = () => {
    if (selectedRuleId) {
      resetMutation.mutate(selectedRuleId);
    }
  };

  const handleDelete = (id: string) => {
    setSelectedRuleId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRuleId) {
      deleteMutation.mutate(selectedRuleId);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">规则管理</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> 新建规则
        </Button>
      </div>

      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {rules.map((rule) => (
          <Card
            key={rule.id}
            className="shadow-sm"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{rule.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {instruments.find((i) => i.id === rule.instrumentId)?.name || rule.instrumentId}
                  </CardDescription>
                </div>
                <Badge variant={rule.active ? 'default' : 'secondary'}>{rule.active ? '启用' : '禁用'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                <span>
                  类型:{' '}
                  <Badge
                    variant="outline"
                    className="ml-1"
                  >
                    {rule.type}
                  </Badge>
                </span>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(rule)}
                >
                  <Edit className="h-4 w-4 mr-1" /> 编辑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReset(rule.id)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" /> 重置
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(rule.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> 删除
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {rules.length === 0 && !rulesLoading && <div className="text-center py-10 text-muted-foreground">暂无规则</div>}
      </div>

      {/* Desktop View */}
      <Card className="hidden md:block">
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
                  <TableCell>
                    {instruments.find((i) => i.id === rule.instrumentId)?.name || rule.instrumentId}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{rule.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.active ? 'default' : 'secondary'}>{rule.active ? '启用' : '禁用'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(rule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReset(rule.id)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rules.length === 0 && !rulesLoading && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-24 text-muted-foreground"
                  >
                    暂无规则
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      >
        <DialogContent className="sm:max-w-[600px] border-primary/20 shadow-2xl bg-card">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">{editingRule ? '编辑规则' : '新建规则'}</DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1">
                  配置价格监控规则，当触发条件时发送通知。
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Row 1: Name & Instrument */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-foreground/80 font-medium"
                    >
                      规则名称
                    </Label>
                    <Input
                      id="name"
                      placeholder="例如: 黄金触达提醒"
                      className="bg-secondary/50 border-input focus:border-primary/50 transition-colors"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="instrumentId">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor="instrument"
                      className="text-foreground/80 font-medium"
                    >
                      监控标的
                    </Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => field.handleChange(val)}
                    >
                      <SelectTrigger className="bg-secondary/50 border-input focus:ring-primary/20">
                        <SelectValue placeholder="选择标的" />
                      </SelectTrigger>
                      <SelectContent>
                        {instruments.map((inst) => (
                          <SelectItem
                            key={inst.id}
                            value={inst.id}
                          >
                            <span className="font-medium text-foreground">{inst.name}</span>{' '}
                            <span className="text-muted-foreground text-xs ml-1">({inst.id})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>
            </div>

            {/* Row 2: Type & Target */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field name="type">
                {(field) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor="type"
                      className="text-foreground/80 font-medium"
                    >
                      触发类型
                    </Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => field.handleChange(val)}
                    >
                      <SelectTrigger className="bg-secondary/50 border-input focus:ring-primary/20">
                        <SelectValue placeholder="选择类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="touch">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            <span>触达 (Touch)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="cross_up">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-green-500" />
                            <span>上穿 (Cross Up)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="cross_down">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-red-500" />
                            <span>下穿 (Cross Down)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="range">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-500" />
                            <span>区间 (Range)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>

              <form.Subscribe selector={(state) => [state.values.type]}>
                {([type]) => (
                  <div className="space-y-2">
                    {type === 'range' ? (
                      <>
                        <Label className="text-foreground/80 font-medium">价格区间</Label>
                        <div className="flex items-center gap-2">
                          <form.Field name="lower">
                            {(field) => (
                              <Input
                                type="number"
                                placeholder="下限"
                                className="bg-secondary/50"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                              />
                            )}
                          </form.Field>
                          <span className="text-muted-foreground">-</span>
                          <form.Field name="upper">
                            {(field) => (
                              <Input
                                type="number"
                                placeholder="上限"
                                className="bg-secondary/50"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                              />
                            )}
                          </form.Field>
                        </div>
                      </>
                    ) : (
                      <>
                        <Label className="text-foreground/80 font-medium">目标价格</Label>
                        <div className="relative">
                          <form.Field name="target">
                            {(field) => (
                              <Input
                                type="number"
                                placeholder="0.00"
                                className="bg-secondary/50 pl-8"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                              />
                            )}
                          </form.Field>
                          <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">¥</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </form.Subscribe>
            </div>

            {/* Row 3: Notification Channels */}
            <div className="space-y-3">
              <Label className="text-foreground/80 font-medium">通知渠道</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <form.Field name="notifyChannels">
                  {(field) => (
                    <>
                      {webhooks.map((wh) => {
                        const isSelected = field.state.value.includes(wh.key);
                        return (
                          <button
                            type="button"
                            key={wh.key}
                            tabIndex={wh.configured ? 0 : -1}
                            onClick={() => {
                              if (wh.configured) {
                                const newValue = isSelected
                                  ? field.state.value.filter((v) => v !== wh.key)
                                  : [...field.state.value, wh.key];
                                field.handleChange(newValue);
                              }
                            }}
                            className={`
                              relative flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer text-left
                              ${
                                isSelected
                                  ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                                  : 'border-border hover:bg-secondary/50 hover:border-primary/30'
                              }
                              ${!wh.configured ? 'bg-muted/10 border-dashed cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-primary/50'}
                            `}
                          >
                            <div
                              className={`
                                w-4 h-4 rounded-full border flex items-center justify-center transition-colors
                                ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}
                                ${!wh.configured ? 'opacity-50' : ''}
                              `}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 bg-background rounded-full" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className={`font-medium text-sm truncate ${!wh.configured ? 'text-muted-foreground' : 'text-foreground'}`}
                              >
                                {getTypeLabel(wh.type)}
                              </div>
                              {!wh.configured && (
                                <div className="text-[10px] text-destructive mt-0.5 font-medium">未配置 Webhook</div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </>
                  )}
                </form.Field>
                {webhooks.length === 0 && (
                  <div className="col-span-full text-center p-4 border border-dashed rounded-lg text-sm text-muted-foreground bg-secondary/20">
                    暂无可用通知渠道，请先在设置中添加 Webhook。
                  </div>
                )}
              </div>
            </div>

            {/* Row 4: Throttle & Active */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <form.Field name="throttleMs">
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-foreground/80 font-medium flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> 冷却时间 (毫秒)
                    </Label>
                    <Input
                      type="number"
                      className="bg-secondary/50"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      step={60000}
                    />
                    <p className="text-[10px] text-muted-foreground pl-1">默认 10 分钟 (600000ms)，避免频繁通知。</p>
                  </div>
                )}
              </form.Field>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/20">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="active"
                    className="text-base font-medium"
                  >
                    启用规则
                  </Label>
                  <p className="text-[10px] text-muted-foreground">关闭后将暂停监控，不再触发通知。</p>
                </div>
                <form.Field name="active">
                  {(field) => (
                    <Switch
                      id="active"
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked)}
                    />
                  )}
                </form.Field>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="h-10"
            >
              取消
            </Button>
            <Button
              onClick={() => {
                form.handleSubmit();
              }}
              className="h-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
            >
              {editingRule ? '保存修改' : '立即创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title="确认重置状态？"
        description="这将清除该规则的冷却时间和上次触发记录，可能会立即触发新的通知。"
        onConfirm={confirmReset}
        confirmText="确认重置"
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="确认删除规则？"
        description="此操作无法撤销，该规则将被永久删除。"
        onConfirm={confirmDelete}
        confirmText="确认删除"
        variant="destructive"
      />
    </>
  );
};

const RulesPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AdminLayout selectedKey="rules">
          <RulesContent />
        </AdminLayout>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default RulesPage;
