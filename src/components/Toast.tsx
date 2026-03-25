'use client';

import { useUIStore } from '@/store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 p-4 shadow-[0_24px_48px_-12px_rgba(28,28,24,0.18)] min-w-[300px] border ${
              toast.type === 'success'
                ? 'bg-[#ffffff] border-[#d0c5af]'
                : toast.type === 'error'
                  ? 'bg-[#ffffff] border-[#d0c5af]'
                  : 'bg-[#ffffff] border-[#d0c5af]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-[#2f6f44]" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#8f0402]" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#d4af37]" />}
            
            <span className="flex-1 text-sm font-medium text-[#1c1c18]">{toast.message}</span>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#7f7663] hover:text-[#1c1c18] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
