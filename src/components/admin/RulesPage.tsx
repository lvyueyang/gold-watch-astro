import React, { useEffect, useState } from 'react';
import { Table, Button, Switch, Modal, Form, Input, Select, message, Space, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminLayout from './AdminLayout';

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

const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [form] = Form.useForm();

  // Watch type change to update form fields
  const ruleType = Form.useWatch('type', form);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rules');
      const data = await res.json();
      setRules(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('获取规则失败');
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
      // Only keep configured webhooks? Or all? Let's show all but mark configured.
      // Ideally only allow selecting configured ones, or warn if unconfigured.
      // For now, let's just list them.
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
    form.resetFields();
    // Set default values
    form.setFieldsValue({
      type: 'touch',
      active: true,
      notifyChannels: [],
      throttleMs: 600000, // 10 minutes
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: Rule) => {
    setEditingRule(record);

    // Flatten params and notify for form
    const formData = {
      ...record,
      ...record.params, // Spread params (target, lower, upper)
      notifyChannels: record.notify.channels,
      throttleMs: record.notify.throttleMs,
    };

    form.setFieldsValue(formData);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/rules/${id}`, { method: 'DELETE' });
      message.success('规则已删除');
      fetchRules();
    } catch (error) {
      message.error('删除规则失败');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Construct params based on type
      let params: any = {};
      if (values.type === 'range') {
        params = { lower: values.lower, upper: values.upper };
      } else {
        params = { target: values.target };
      }

      // Construct notify
      const notify = {
        channels: values.notifyChannels,
        throttleMs: values.throttleMs,
      };

      const payload = {
        name: values.name,
        instrumentId: values.instrumentId,
        type: values.type,
        active: values.active,
        params,
        notify,
      };

      if (editingRule) {
        await fetch(`/api/rules/${editingRule.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        message.success('规则更新成功');
      } else {
        await fetch('/api/rules', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        message.success('规则创建成功');
      }
      setIsModalOpen(false);
      fetchRules();
    } catch (error) {
      console.error(error);
      message.error('操作失败');
    }
  };

  const columns = [
    { title: '规则名称', dataIndex: 'name', key: 'name' },
    { title: '标的', dataIndex: 'instrumentId', key: 'instrumentId' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    {
      title: '启用状态',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Switch
          checked={active}
          disabled
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Rule) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout selectedKey="rules">
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          新建规则
        </Button>
      </div>
      <Table
        dataSource={rules}
        columns={columns}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingRule ? '编辑规则' : '新建规则'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="规则名称"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="instrumentId"
            label="监控标的"
            rules={[{ required: true, message: '请选择监控标的' }]}
          >
            <Select placeholder="请选择">
              {instruments.map((inst) => (
                <Select.Option
                  key={inst.id}
                  value={inst.id}
                >
                  {inst.name} ({inst.id})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="type"
            label="触发类型"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="touch">触达 (Touch)</Select.Option>
              <Select.Option value="cross_up">上穿 (Cross Up)</Select.Option>
              <Select.Option value="cross_down">下穿 (Cross Down)</Select.Option>
              <Select.Option value="range">区间 (Range)</Select.Option>
            </Select>
          </Form.Item>

          {ruleType === 'range' ? (
            <Form.Item
              label="价格区间"
              style={{ marginBottom: 0 }}
            >
              <div style={{ display: 'flex', gap: 8 }}>
                <Form.Item
                  name="lower"
                  rules={[{ required: true, message: '请输入下限' }]}
                  style={{ flex: 1 }}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="下限"
                    step={0.01}
                  />
                </Form.Item>
                <span style={{ lineHeight: '32px' }}>-</span>
                <Form.Item
                  name="upper"
                  rules={[{ required: true, message: '请输入上限' }]}
                  style={{ flex: 1 }}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="上限"
                    step={0.01}
                  />
                </Form.Item>
              </div>
            </Form.Item>
          ) : (
            <Form.Item
              name="target"
              label="目标价格"
              rules={[{ required: true, message: '请输入目标价格' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                step={0.01}
                placeholder="例如: 580.00"
              />
            </Form.Item>
          )}

          <Form.Item label="通知配置">
            <Form.Item
              name="notifyChannels"
              label="通知渠道"
              rules={[{ required: true, message: '请选择至少一个通知渠道' }]}
            >
              <Select
                mode="multiple"
                placeholder="请选择渠道"
              >
                {webhooks.map((wh) => (
                  <Select.Option
                    key={wh.key}
                    value={wh.key}
                    disabled={!wh.configured}
                  >
                    {wh.type} {wh.configured ? '' : '(未配置)'}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="throttleMs"
              label="通知冷却时间 (毫秒)"
              rules={[{ required: true }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                step={60000}
              />
            </Form.Item>
          </Form.Item>
          <Form.Item
            name="active"
            label="启用"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default RulesPage;
