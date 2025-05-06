import { FormFieldProps } from '@apps-next/core';
import { cn, Label } from '@apps-next/ui';
import { AlertCircle } from 'lucide-react';
import { onBlur, onChange, onKeyDown } from './render-form-field';

const StringFormField = (props: FormFieldProps) => {
  const error = props.formState.errors?.[props.field.field?.name ?? ''];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row gap-2 items-center pb-4">
        <div className="min-w-6 h-4">
          {props.field.icon ? (
            <props.field.icon className="h-3 w-3 text-foreground" />
          ) : null}
        </div>

        <Label className="max-w-[16rem] min-w-[16rem]">
          {props.field.label}
        </Label>

        <input
          placeholder={props.field.label}
          value={(props.field.value as string) || ''}
          className={cn('outline-none focus:border-b-[1px] w-full', 'text-sm')}
          onKeyDown={(e) => onKeyDown(e, props, true)}
          onBlur={(e) => onBlur(e, props, true)}
          onChange={(e) => onChange(e, props, true)}
        />
      </div>

      {error && (
        <div className="flex items-center text-red-500 text-sm mt-1">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error.error}
        </div>
      )}
    </div>
  );
};

export const TabsFormField = (props: FormFieldProps) => {
  const field = props.field;
  const fieldType = field.field?.type;

  switch (fieldType) {
    case 'String':
      return <StringFormField {...props} />;
    case 'Number':
      break;

    default:
      break;
  }

  return null;
};
