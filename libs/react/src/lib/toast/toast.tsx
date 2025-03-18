import { toast as sonnerToast } from 'sonner';
import { ToastProps } from './types';
import { Toast } from './toast-component';

export function toast(toast: Omit<ToastProps, 'id'>) {
  return sonnerToast.custom(
    (id) => (
      <Toast
        id={id}
        {...toast} // Spread the rest of the props
      />
    ),
    { duration: toast.duration }
  );
}

export const renderErrorToast = (message: string, cb: () => void) => {
  toast({
    title: 'error.title',
    duration: 5000,
    variant: 'error',
    description: message,
    button: {
      label: 'error.showDetails',
      onClick: () => {
        cb();
      },
    },
  });
};
