import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, ConfigProvider, Switch, Space } from 'antd';
import { DashboardOutlined, LineChartOutlined, SettingOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
  selectedKey: string;
}

const AdminLayoutContent: React.FC<AdminLayoutProps & { isDarkMode: boolean, toggleTheme: () => void }> = ({ children, selectedKey, isDarkMode, toggleTheme }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const items = [
    { 
      key: 'rules', 
      icon: <LineChartOutlined />, 
      label: '规则管理', 
      onClick: () => window.location.href = '/admin' 
    },
    { 
      key: 'instruments', 
      icon: <DashboardOutlined />, 
      label: '标的管理', 
      onClick: () => window.location.href = '/admin/instruments' 
    },
    { 
      key: 'webhooks', 
      icon: <SettingOutlined />, 
      label: '通知渠道', 
      onClick: () => window.location.href = '/admin/webhooks' 
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0" theme={isDarkMode ? 'dark' : 'light'}>
        <div style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.2)',
          textAlign: 'center',
          color: isDarkMode ? 'white' : 'black',
          lineHeight: '32px',
          fontWeight: 'bold'
        }}>
          GoldWatch
        </div>
        <Menu theme={isDarkMode ? 'dark' : 'light'} mode="inline" defaultSelectedKeys={[selectedKey]} items={items} />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Space>
            <span>{isDarkMode ? '暗色模式' : '亮色模式'}</span>
            <Switch 
              checkedChildren={<BulbFilled />} 
              unCheckedChildren={<BulbOutlined />} 
              checked={isDarkMode} 
              onChange={toggleTheme} 
            />
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          GoldWatch ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setIsDarkMode(saved === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <AdminLayoutContent {...props} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
    </ConfigProvider>
  );
};

export default AdminLayout;
