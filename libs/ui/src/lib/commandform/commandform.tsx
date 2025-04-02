import {
  CommandformProps,
  getTableLabel,
  getViewLabel,
  useTranslation,
} from '@apps-next/core';
import { DialogTitle } from '@radix-ui/react-dialog';
import { StickyNoteIcon, TerminalSquareIcon } from 'lucide-react';
import React from 'react';
import { Button, Dialog, DialogContent } from '../components';
import { Checkbox } from '../components/checkbox';
import { Command, CommandSeparator } from '../components/command';
import { cn } from '../utils';

const CommandformContainer = (
  props: (CommandformProps & { children: React.ReactNode }) | undefined
) => {
  if (!props) return null;

  return (
    <Dialog
      {...props}
      open={props?.open}
      // modal={}
      modal={false}
      onOpenChange={(open) => {
        !open && props.onClose?.();
      }}
    >
      <DialogContent
        className="overflow-hidden p-0 rounded-md"
        data-testid="commandform"
      >
        <DialogTitle className="sr-only">Commandbar Dialog</DialogTitle>
        {props.children}
      </DialogContent>

      <div className="fixed top-0 left-0 h-screen w-screen bg-foreground/10" />
    </Dialog>
  );
};

export const CommandFormBadge = (props: {
  label?: string;
  icon?: React.ReactNode;
  active?: boolean;
  children?: React.ReactNode;
}) => {
  const active = props.active === true ? true : false;
  return (
    <div
      className={cn(
        'text-[11px] flex flex-row font-[500] gap-1 h-6 items-center border border-foreground/10 px-2 max-w-fit rounded-sm',
        active ? 'text-foreground/70' : 'text-foreground/50'
      )}
    >
      {/* <div><props.icon className="text-yellow-400 w-3 h-3" /></div> */}
      {props.children ? (
        <>{props.children}</>
      ) : (
        <>
          <div>{props.icon}</div>
          <div>{props.label}</div>
        </>
      )}
    </div>
  );
};

const Header = () => {
  return (
    <div className="flex flex-row items-center gap-2">
      <CommandFormBadge
        icon={<TerminalSquareIcon className="text-yellow-500 h-3 w-3" />}
        label="DEV"
      />
      <div className="text-[10px]">{'>'}</div>
      <CommandFormBadge
        icon={<StickyNoteIcon className="h-3 w-3" />}
        label="Template"
      />
    </div>
  );
};

export function Commandform(props: CommandformProps | undefined) {
  const { t } = useTranslation();

  if (!props?.open) return null;

  return (
    <>
      <CommandformContainer {...props}>
        <Command
          shouldFilter={false}
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          <div
            key={'content-commanform'}
            className="px-3 pt-3 pb-1 flex flex-col gap-4"
          >
            <Header />

            {props.primitiveFields
              .filter(
                (field) =>
                  field.field?.type !== 'Date' && !field.field?.richEditor
              )
              .map((field, index) => {
                if (field.field?.type === 'String') {
                  return (
                    <div key={`primitive-string-field-${field.field?.name}`}>
                      <input
                        autoFocus={index === 0}
                        placeholder={field.label}
                        value={(field.value as string) || ''}
                        className={cn(
                          'outline-none border-none w-full',
                          field.field.isDisplayField ? 'text-lg' : 'text-base'
                        )}
                        onChange={(e) => {
                          props.onInputChange(field, e.currentTarget.value);
                        }}
                      />
                    </div>
                  );
                }
                return <div>NOT YET: {field.field?.name}</div>;
              })}

            {props.primitiveFields
              .filter((field) => field.field?.richEditor)
              .map((field) => {
                return (
                  <div key={`primitive-textarea-field-${field.field?.name}`}>
                    <textarea
                      placeholder={t('richEditor.placeholder', {
                        name: field.label,
                      })}
                      className="text-base outline-none border-none w-full pb-12"
                      cols={3}
                      onChange={(e) => {
                        props.onInputChange(field, e.currentTarget.value);
                      }}
                      value={(field.value as string) || undefined}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const target = e.target as HTMLTextAreaElement;
                          const start = target.selectionStart;
                          const end = target.selectionEnd;
                          const value = target.value;
                          target.value =
                            value.substring(0, start) +
                            '\n' +
                            value.substring(end);
                          target.selectionStart = target.selectionEnd =
                            start + 1;
                        }
                      }}
                    />
                  </div>
                );
              })}

            <div className="flex flex-row gap-4">
              {props.primitiveFields.map((field) => {
                if (field.field?.type === 'Boolean') {
                  return (
                    <div
                      key={`primitive-boolean-field-${field.field.name}`}
                      className="flex flex-row gap-2 items-center text-sm"
                    >
                      <Checkbox
                        defaultChecked={field.field.defaultValue as boolean}
                        onCheckedChange={(checked) => {
                          props.onCheckedChange(field, Boolean(checked));
                        }}
                        className="h-4 w-4"
                      />
                      <div>{field.label}</div>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center gap-2">
                {props.complexFields.map((f) => {
                  return (
                    <button
                      key={`complex-field-btn-commandform-${f.field?.name}`}
                      onClick={(e) => {
                        props.onClick(
                          f,
                          e.currentTarget.getBoundingClientRect()
                        );
                      }}
                    >
                      {props.render(f)}
                    </button>
                  );
                })}
              </div>

              <CommandSeparator className="my-0" />

              <div className="flex flex-row items-center justify-between pb-2">
                <div />
                <Button
                  disabled={!props.formState.isReady}
                  onClick={() => props.onSubmit()}
                  size={'sm'}
                >
                  {t(`commandform.${props.type}`, {
                    name: getTableLabel('tasks', true),
                  })}
                </Button>
              </div>
            </div>
          </div>
        </Command>
      </CommandformContainer>
    </>
  );
}

// export const commandform = {
//   default: CommandformDefault,
// };

// Commandform
