'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastOptions {
  title: string;
  description?: string;
  message?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const type: ToastType = (options.type || 
      (options.variant === 'error' ? 'error' : 
       options.variant === 'success' ? 'success' : 
       options.variant === 'warning' ? 'warning' : 'info')) as ToastType;

    addToast({
      title: options.title,
      message: options.description || options.message,
      type,
      duration: options.duration || 4000,
    });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({
  toasts,
  removeToast,
}) => {
  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 z-[100] flex flex-col items-center sm:items-end px-4 py-6 pointer-events-none sm:p-6 gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; removeToast: (id: string) => void }> = ({
  toast,
  removeToast,
}) => {
  const { id, type, title, message, duration = 5000 } = toast;

  useEffect(() => {
    if (duration !== Infinity) {
      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, removeToast]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  };

  const bgColors = {
    success: 'bg-white border-l-4 border-green-500',
    error: 'bg-white border-l-4 border-red-500',
    info: 'bg-white border-l-4 border-blue-500',
    warning: 'bg-white border-l-4 border-amber-500',
  };

  return (
    <div
      className={`
        pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 
        animate-in slide-in-from-top sm:slide-in-from-right fade-in duration-300
        ${bgColors[type]}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{icons[type]}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-slate-900">{title}</p>
            {message && <p className="mt-1 text-sm text-slate-500">{message}</p>}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => removeToast(id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
