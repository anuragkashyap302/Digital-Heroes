import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 4500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setNotifications((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = {
    success: (msg, dur) => addNotification(msg, 'success', dur),
    error: (msg, dur) => addNotification(msg, 'error', dur || 6000),
    info: (msg, dur) => addNotification(msg, 'info', dur)
  };

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-soft-lg border backdrop-blur-md ${
                n.type === 'success'
                  ? 'bg-emerald-900/90 text-white border-emerald-500/30'
                  : n.type === 'error'
                  ? 'bg-rose-950/90 text-white border-rose-500/30'
                  : 'bg-ink/90 text-canvas border-sage/30'
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {n.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {n.type === 'info' && <Info className="w-5 h-5 text-gold-light" />}
              </span>

              <p className="text-sm font-medium leading-relaxed flex-1">{n.message}</p>

              <button
                onClick={() => removeNotification(n.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-1 text-canvas"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
