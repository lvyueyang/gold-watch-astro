import React, { createContext, useContext, useState } from 'react';

type ToastItem = {
  id: number;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive';
};

type ToastContextValue = {
  show: (t: Omit<ToastItem, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = (t: Omit<ToastItem, 'id'>) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, ...t }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`rounded-md border px-4 py-2 shadow-sm bg-card text-card-foreground ${
              item.variant === 'success'
                ? 'border-green-500'
                : item.variant === 'destructive'
                ? 'border-red-500'
                : 'border-muted'
            }`}
          >
            {item.title && <div className="font-medium">{item.title}</div>}
            {item.description && <div className="text-sm text-muted-foreground">{item.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

export function Toaster() {
  return null;
}
