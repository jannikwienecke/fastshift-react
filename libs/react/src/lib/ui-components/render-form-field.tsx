import { FormFieldProps } from '@apps-next/core';
import { cn } from '@apps-next/ui';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Element = HTMLInputElement | HTMLTextAreaElement;
const onKeyDown = (e: React.KeyboardEvent<Element>, props: FormFieldProps) => {
  const isEnter = e.key === 'Enter';
  const isTab = e.key === 'Tab';

  if (
    isEnter ||
    (isTab && !props.formState.errors?.[props.field.field?.name ?? ''])
  ) {
    props.onEnter(props.field);
  }
};

const onKeyDownTextare = (
  e: React.KeyboardEvent<Element>,
  props: FormFieldProps
) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const value = target.value;
    target.value = value.substring(0, start) + '\n' + value.substring(end);
    target.selectionStart = target.selectionEnd = start + 1;

    props.onInputChange(props.field, e.currentTarget.value);

    setTimeout(() => {
      props.onEnter(props.field);
    }, 200);
  }
};

const onBlur = (e: React.FocusEvent<Element>, props: FormFieldProps) => {
  const error = props.formState.errors?.[props.field.field?.name ?? ''];

  if (error) {
    e.currentTarget.focus();
  }

  props.onBlurInput(props.field);
};

const onChange = (e: React.ChangeEvent<Element>, props: FormFieldProps) => {
  props.onInputChange(props.field, e.currentTarget.value);
};

const TextAreaFormField = (props: FormFieldProps) => {
  const { t } = useTranslation();

  const field = props.field;
  return (
    <>
      <div key={`primitive-textarea-field-${field.field?.name}`}>
        <textarea
          placeholder={t('richEditor.placeholder', {
            name: field.label,
          })}
          className="text-base outline-none border-none w-full pb-12 pt-8"
          cols={3}
          onChange={(e) => onChange(e, props)}
          onBlur={(e) => onBlur(e, props)}
          value={(field.value as string) || undefined}
          onKeyDown={(e) => onKeyDownTextare(e, props)}
        />
      </div>
    </>
  );
};

const StringFormField = (props: FormFieldProps) => {
  const error = props.formState.errors?.[props.field.field?.name ?? ''];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row gap-2 items-center pb-4">
        <>
          {props.field.icon ? (
            <props.field.icon className="h-3 w-3 text-foreground" />
          ) : null}
        </>

        <input
          autoFocus={true}
          placeholder={props.field.label}
          value={(props.field.value as string) || ''}
          className={cn(
            'outline-none focus:border-b-[1px] w-full',
            props.field.field?.isDisplayField ? 'text-2x' : 'text-base'
          )}
          onKeyDown={(e) => onKeyDown(e, props)}
          onBlur={(e) => onBlur(e, props)}
          onChange={(e) => onChange(e, props)}
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

export const FormField = (props: FormFieldProps) => {
  const field = props.field;
  const fieldType = field.field?.type;

  if (field.field?.richEditor) {
    return <TextAreaFormField {...props} />;
  }

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
