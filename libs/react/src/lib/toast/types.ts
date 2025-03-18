export interface ToastProps {
  id: string | number;
  title: string;
  description: string;
  variant?: 'default' | 'warning' | 'error';
  duration?: number;
  button?: {
    label: string;
    onClick: () => void;
  };
}
