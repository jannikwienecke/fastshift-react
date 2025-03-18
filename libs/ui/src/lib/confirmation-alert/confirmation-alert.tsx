import { ConfirmationDialogProps, useTranslation } from '@apps-next/core';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/alert-dialog';

function ConfirmationDialogDefault(props: ConfirmationDialogProps) {
  const { t } = useTranslation();
  return (
    <AlertDialog
      open={!!props.open}
      onOpenChange={(open) => {
        const removePointerEvents = () => {
          const body = document.querySelector('body');

          if (body) {
            body.style.pointerEvents = '';
          }
        };

        if (!open) {
          props.onClose();

          setTimeout(() => {
            removePointerEvents();
          }, 200);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <ConfirmationDialogTitle>
            {props.title ? t(props.title) : t('confirmationAlert.title')}
          </ConfirmationDialogTitle>

          <ConfirmationDialogDescription>
            {props.description
              ? props.description
              : t('confirmationAlert.description')}
          </ConfirmationDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <ConfirmationDialogConfirmCancel>
            {props.cancelLabel ? props.cancelLabel : t('common.cancel')}
          </ConfirmationDialogConfirmCancel>

          <ConfirmationDialogConfirmButton onClick={props.onSubmit}>
            {props.submitLabel ? props.submitLabel : t('common.confirm')}
          </ConfirmationDialogConfirmButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ConfirmationDialogConfirmButton(props: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <AlertDialogAction onClick={props.onClick}>
      {props.children}
    </AlertDialogAction>
  );
}

function ConfirmationDialogConfirmCancel(props: { children: React.ReactNode }) {
  return <AlertDialogCancel>{props.children}</AlertDialogCancel>;
}

function ConfirmationDialogTitle(props: { children: React.ReactNode }) {
  return <AlertDialogTitle>{props.children}</AlertDialogTitle>;
}
function ConfirmationDialogDescription(props: { children: React.ReactNode }) {
  return <AlertDialogDescription>{props.children}</AlertDialogDescription>;
}

export const ConfirmationDialog = {
  Default: ConfirmationDialogDefault,
  ConfirmButton: ConfirmationDialogConfirmButton,
  ConfirmCancel: ConfirmationDialogConfirmCancel,
  Title: ConfirmationDialogTitle,
  Description: ConfirmationDialogDescription,
};
