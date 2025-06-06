import { toast as sonnerToast } from 'sonner';
import { ToastProps } from './types';
import { Toast } from './toast-component';
import {
  MutationHandlerErrorType,
  MutationHandlerReturnType,
  MutationReturnDto,
} from '@apps-next/core';
import { store$ } from '../legend-store';
import { error } from 'console';

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

export const renderError = (error: MutationHandlerErrorType) => {
  toast({
    title: 'error.title',
    duration: 5000,
    variant: 'error',
    description: error.message,
    button: {
      label: 'error.showDetails',
      onClick: () => {
        store$.errorDialog.error.set(error);
      },
    },
  });
};

export const renderSuccessToast = (message: string) => {
  toast({
    title: 'success.createRecord.title',
    duration: 3000,
    variant: 'default',
    description: message,
  });
};
