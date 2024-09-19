import { InputDialogProps } from '@apps-next/core';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '../components';
import { cn } from '../utils';

export function InputDialogDefault(props: InputDialogProps) {
  return (
    <Dialog
      open={props.open && props.inputList.length > 0}
      onOpenChange={props.onOpenChange}
    >
      <DialogContent className={cn('sm:max-w-[425px]', props.className)}>
        <DialogHeader>
          <InputDialogTitle>{props.title}</InputDialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="items-center gap-4">
            {props.inputList.map((input) => (
              <InputDialogInputField
                key={input.id}
                id={input.id}
                value={input.value}
                onChange={input.onChange}
                placeholder={input.placeholder}
              />
            ))}
          </div>
        </div>

        <DialogFooter>
          <InputDialogCancelBtn onCancel={props.onCancel}>
            Cancel
          </InputDialogCancelBtn>

          <InputDialogSubmitBtn onSubmit={props.onSubmit}>
            Save changes
          </InputDialogSubmitBtn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const InputDialogSubmitBtn = ({
  onSubmit,
  children,
}: {
  onSubmit: () => void;
  children: React.ReactNode;
}) => {
  return <Button onClick={onSubmit}>{children}</Button>;
};

const InputDialogCancelBtn = ({
  onCancel,
  children,
}: {
  onCancel: () => void;
  children: React.ReactNode;
}) => {
  return <Button onClick={onCancel}>{children}</Button>;
};

const InputDialogTitle = ({ children }: { children: React.ReactNode }) => {
  return <DialogTitle>{children}</DialogTitle>;
};

const InputDialogInputField = ({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) => {
  return (
    <Input
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};

export const InputDialog = {
  Default: InputDialogDefault,
  SubmitBtn: InputDialogSubmitBtn,
  CancelBtn: InputDialogCancelBtn,
  Title: InputDialogTitle,
  InputField: InputDialogInputField,
};
