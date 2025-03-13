import { TranslationKeys, useTranslation } from '@apps-next/core';
import { cva } from 'class-variance-authority';
import clsx, { ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import { ToastProps } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const toastVariants = cva(
  'flex rounded-lg shadow-lg ring-1 w-full md:max-w-[364px] items-center p-4',
  {
    variants: {
      variant: {
        default: 'bg-white ring-black/5',
        warning: 'bg-amber-50 ring-amber-200',
        error: 'bg-red-50 ring-red-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const buttonVariants = cva('rounded px-3 py-1 text-sm font-semibold', {
  variants: {
    variant: {
      default: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
      warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
      error: 'bg-red-100 text-red-700 hover:bg-red-200',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const textVariants = cva('text-sm', {
  variants: {
    variant: {
      default: 'text-gray-900',
      warning: 'text-amber-800',
      error: 'text-red-800',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const descriptionVariants = cva('mt-1 text-sm', {
  variants: {
    variant: {
      default: 'text-gray-500',
      warning: 'text-amber-600',
      error: 'text-red-600',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

/** A fully custom toast that still maintains the animations and interactions. */
export function Toast(props: ToastProps) {
  const { t } = useTranslation();

  const { title, description, button, id, variant = 'default' } = props;

  const translate = (key: string) => {
    return t(key as TranslationKeys);
  };

  // Always render button for warning and error variants
  const shouldShowButton =
    button || variant === 'warning' || variant === 'error';
  const buttonText =
    button?.label ||
    (variant === 'warning' ? 'Dismiss' : variant === 'error' ? 'Close' : '');
  const buttonAction = button?.onClick || (() => toast.dismiss(id));
  return (
    <div className={cn(toastVariants({ variant }))}>
      <div className="flex flex-1 items-center">
        <div className="w-full">
          <p className={cn(textVariants({ variant }))}>{translate(title)}</p>
          <p className={cn(descriptionVariants({ variant }), 'pl-0')}>
            {translate(description)}
          </p>
        </div>
      </div>

      {shouldShowButton ? (
        <div className="ml-5 shrink-0">
          <button
            className={cn(buttonVariants({ variant }))}
            onClick={() => {
              buttonAction();
              toast.dismiss(id);
            }}
          >
            {translate(buttonText)}
          </button>
        </div>
      ) : null}
    </div>
  );
}
