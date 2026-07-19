'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, XCircle, Info, X } from 'lucide-react';

type PopupType = 'success' | 'error' | 'warning' | 'info';

interface PopupContextType {
  showAlert: (title: string, message: string, type?: PopupType) => void;
  showConfirm: (title: string, message: string) => Promise<boolean>;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function usePopup() {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}

export function PopupProvider({ children }: { children: ReactNode }) {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: PopupType;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    resolve: (value: boolean) => void;
  } | null>(null);

  const showAlert = (title: string, message: string, type: PopupType = 'info') => {
    setAlertState({ isOpen: true, title, message, type });
  };

  const showConfirm = (title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ isOpen: true, title, message, resolve });
    });
  };

  const closeAlert = () => setAlertState((prev) => ({ ...prev, isOpen: false }));
  
  const handleConfirm = (value: boolean) => {
    if (confirmState) {
      confirmState.resolve(value);
      setConfirmState(null);
    }
  };

  const getIcon = (type: PopupType) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-8 h-8 text-cyber-lime" />;
      case 'error': return <XCircle className="w-8 h-8 text-error" />;
      case 'warning': return <AlertCircle className="w-8 h-8 text-[#FF9800]" />;
      case 'info': return <Info className="w-8 h-8 text-electric-blue" />;
    }
  };

  return (
    <PopupContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      <AnimatePresence>
        {/* Alert Modal */}
        {alertState.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAlert}
              className="absolute inset-0 bg-deep-obsidian/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[rgba(255,255,255,0.95)] rounded-3xl border-4 border-deep-obsidian p-6 shadow-[8px_8px_0px_rgba(10,10,10,1)] z-10 overflow-hidden"
            >
              <button 
                onClick={closeAlert}
                className="absolute top-4 right-4 text-surface-variant hover:text-deep-obsidian transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center mt-2">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 border-deep-obsidian ${
                  alertState.type === 'success' ? 'bg-cyber-lime/20' :
                  alertState.type === 'error' ? 'bg-error/20' :
                  alertState.type === 'warning' ? 'bg-[#FF9800]/20' :
                  'bg-electric-blue/20'
                }`}>
                  {getIcon(alertState.type)}
                </div>
                <h3 className="font-heading text-xl font-bold text-deep-obsidian mb-2">{alertState.title}</h3>
                <p className="font-sans text-on-surface-variant text-sm mb-6">{alertState.message}</p>
                <button 
                  onClick={closeAlert}
                  className="w-full py-3 rounded-full bg-deep-obsidian text-white font-heading font-bold text-sm hover:scale-105 transition-transform"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Confirm Modal */}
        {confirmState?.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleConfirm(false)}
              className="absolute inset-0 bg-deep-obsidian/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[rgba(255,255,255,0.95)] rounded-3xl border-4 border-deep-obsidian p-6 shadow-[8px_8px_0px_rgba(10,10,10,1)] z-10"
            >
              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-16 h-16 rounded-full bg-[#FF9800]/20 flex items-center justify-center mb-4 border-2 border-deep-obsidian">
                  <AlertCircle className="w-8 h-8 text-[#FF9800]" />
                </div>
                <h3 className="font-heading text-xl font-bold text-deep-obsidian mb-2">{confirmState.title}</h3>
                <p className="font-sans text-on-surface-variant text-sm mb-6">{confirmState.message}</p>
                
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => handleConfirm(false)}
                    className="flex-1 py-3 rounded-full border-2 border-deep-obsidian text-deep-obsidian font-heading font-bold text-sm hover:bg-surface-variant transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => handleConfirm(true)}
                    className="flex-1 py-3 rounded-full bg-deep-obsidian text-white font-heading font-bold text-sm hover:bg-error transition-colors border-2 border-deep-obsidian"
                  >
                    Ya, Yakin
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PopupContext.Provider>
  );
}
