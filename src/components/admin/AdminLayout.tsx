import { BellRing, Lightbulb, LightbulbOff, LineChart, ScrollText } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Toaster, ToastProvider } from "@/components/ui/toast";

interface AdminLayoutProps {
  children: React.ReactNode;
  selectedKey: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      setIsDarkMode(saved === "dark");
    }
    const initialDark = saved ? saved === "dark" : true;
    if (initialDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    if (newMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const navItems = [
    { key: "rules", label: "规则管理", icon: ScrollText, href: "/admin" },
    { key: "instruments", label: "标的管理", icon: LineChart, href: "/admin/instruments" },
    { key: "webhooks", label: "通知渠道", icon: BellRing, href: "/admin/webhooks" },
  ];

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground font-sans">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0">
          <div className="h-16 flex items-center justify-center border-b px-6">
            <span className="text-xl font-bold text-primary tracking-tight">GoldWatch</span>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  props.selectedKey === item.key
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={toggleTheme}>
              {isDarkMode ? (
                <LightbulbOff className="w-5 h-5" />
              ) : (
                <Lightbulb className="w-5 h-5" />
              )}
              <span>{isDarkMode ? "关闭暗黑模式" : "开启暗黑模式"}</span>
            </Button>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden h-14 border-b bg-card/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-50">
          <span className="font-bold text-lg text-primary">GoldWatch</span>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDarkMode ? <LightbulbOff className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden pb-20 md:pb-0">
          <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
              {props.children}
            </div>
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-lg border-t flex items-center justify-around px-2 z-50 pb-safe safe-area-bottom">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                props.selectedKey === item.key
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon
                className={`w-6 h-6 ${props.selectedKey === item.key ? "stroke-[2.5px]" : ""}`}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
      <Toaster />
    </ToastProvider>
  );
};

export default AdminLayout;
