import { Toaster, toast as hotToast } from 'react-hot-toast';

export const toast = {
  success: (message: string) =>
    hotToast.success(message, {
      icon: '✅',
      style: {
        background: 'rgba(15,15,25,0.97)',
        border: '1px solid rgba(34,197,94,0.3)',
        color: '#f0f0ff',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        fontSize: '14px',
        fontWeight: '500',
      },
    }),
  error: (message: string) =>
    hotToast.error(message, {
      icon: '❌',
      style: {
        background: 'rgba(15,15,25,0.97)',
        border: '1px solid rgba(239,68,68,0.3)',
        color: '#f0f0ff',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        fontSize: '14px',
        fontWeight: '500',
      },
    }),
  loading: (message: string) =>
    hotToast.loading(message, {
      style: {
        background: 'rgba(15,15,25,0.97)',
        border: '1px solid rgba(124,58,237,0.3)',
        color: '#f0f0ff',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        fontSize: '14px',
        fontWeight: '500',
      },
    }),
  dismiss: hotToast.dismiss,
};

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(15,15,25,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#f0f0ff',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          fontSize: '14px',
          fontWeight: '500',
        },
      }}
    />
  );
}
