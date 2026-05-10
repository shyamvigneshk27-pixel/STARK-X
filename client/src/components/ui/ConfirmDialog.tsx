import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
              >
                <div className="glass rounded-2xl p-6 shadow-glow-lg border border-white/10">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                      confirmVariant === 'danger' ? 'bg-red-500/20' : 'bg-primary-500/20'
                    )}>
                      <AlertTriangle className={cn(
                        'w-5 h-5',
                        confirmVariant === 'danger' ? 'text-red-400' : 'text-primary-400'
                      )} />
                    </div>
                    <div className="flex-1">
                      <Dialog.Title className="text-lg font-bold text-white">{title}</Dialog.Title>
                      <Dialog.Description className="text-sm text-white/60 mt-1">{description}</Dialog.Description>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={onClose}
                      className="btn-glass text-sm px-4 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { onConfirm(); onClose(); }}
                      className={cn(
                        'text-sm px-4 py-2 rounded-xl font-semibold transition-all',
                        confirmVariant === 'danger'
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : 'btn-primary'
                      )}
                    >
                      {confirmLabel}
                    </button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
