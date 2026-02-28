import React, { useEffect, useState } from 'react';
import { Lightbulb, LightbulbOff } from 'lucide-react';
import { Toaster, ToastProvider } from '@/components/ui/toast';

interface AdminLayoutProps {
  children: React.ReactNode;
  selectedKey: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setIsDarkMode(saved === 'dark');
    }
    const initialDark = saved ? saved === 'dark' : true;
    if (initialDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-background text-foreground">
        <aside className="w-56 border-r bg-card">
          <div className="h-12 m-4 rounded-md bg-primary/10 text-center leading-[48px] font-bold">GoldWatch</div>
          <nav className="px-2 space-y-1">
            <button
              className={`w-full text-left px-3 py-2 rounded-md ${props.selectedKey === 'rules' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
              onClick={() => (window.location.href = '/admin')}
            >
              规则管理
            </button>
            <button
              className={`w-full text-left px-3 py-2 rounded-md ${props.selectedKey === 'instruments' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
              onClick={() => (window.location.href = '/admin/instruments')}
            >
              标的管理
            </button>
            <button
              className={`w-full text-left px-3 py-2 rounded-md ${props.selectedKey === 'webhooks' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
              onClick={() => (window.location.href = '/admin/webhooks')}
            >
              通知渠道
            </button>
          </nav>
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="h-12 px-4 border-b flex items-center justify-end">
            <button
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground"
              onClick={toggleTheme}
              aria-label="toggle theme"
            >
              {isDarkMode ? <Lightbulb className="h-4 w-4" /> : <LightbulbOff className="h-4 w-4" />}
              {isDarkMode ? '暗色模式' : '亮色模式'}
            </button>
          </header>
          <main className="p-6">
            <div className="rounded-lg border bg-card p-6">{props.children}</div>
          </main>
          <footer className="text-center py-4 border-t">GoldWatch ©{new Date().getFullYear()}</footer>
        </div>
        <Toaster />
      </div>
    </ToastProvider>
  );
};

export default AdminLayout;
