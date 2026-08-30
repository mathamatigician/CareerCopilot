import React, { useEffect } from 'react';
import { Zap } from 'lucide-react';

interface ShortcutToastProps {
  message: string;
  keys?: string[];
  visible?: boolean;
  onClose?: () => void;
  duration?: number;
}

export const ShortcutToast: React.FC<ShortcutToastProps> = ({
  message,
  keys,
  visible = true,
  onClose,
  duration = 2500,
}) => {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [visible, message, duration, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200 pointer-events-none">
      <div className="bg-slate-900/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3">
        <div className="w-6 h-6 rounded-lg bg-red-600/90 flex items-center justify-center text-white shrink-0 shadow-xs">
          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-tight text-slate-100">{message}</span>
          {keys && keys.length > 0 && (
            <div className="flex items-center gap-1">
              {keys.map((k, i) => (
                <kbd
                  key={i}
                  className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[10px] font-mono font-bold text-red-300 shadow-2xs"
                >
                  {k}
                </kbd>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
