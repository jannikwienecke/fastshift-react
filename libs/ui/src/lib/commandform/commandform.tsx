import { CommandformProps } from '@apps-next/core';
import { DialogTitle } from '@radix-ui/react-dialog';
import { StickyNoteIcon, TerminalSquareIcon } from 'lucide-react';
import React from 'react';
import { Button, Dialog, DialogContent } from '../components';
import { Command, CommandSeparator } from '../components/command';
import { cn } from '../utils';
import { Checkbox } from '../components/checkbox';

const CommandformContainer = (
  props: (CommandformProps & { children: React.ReactNode }) | undefined
) => {
  if (!props) return null;

  return (
    <Dialog
      {...props}
      open={props?.open}
      modal={false}
      onOpenChange={(open) => {
        !open && props.onClose?.();
      }}
    >
      <DialogContent className="overflow-hidden p-0 rounded-md">
        <DialogTitle className="sr-only">Commandbar Dialog</DialogTitle>
        {props.children}
      </DialogContent>
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
  if (!props?.open) return null;

  return (
    <>
      <CommandformContainer {...props}>
        <Command
          shouldFilter={false}
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          <div className="px-3 pt-3 pb-1 flex flex-col gap-4">
            <Header />

            {props.primitiveFields.map((field) => {
              if (field.field?.type === 'Boolean') {
                return null;
              }

              if (field.field?.type === 'String') {
                return (
                  <div>
                    <input
                      placeholder={field.label}
                      defaultValue={(field.field.defaultValue as string) ?? ''}
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

            {/* <div>
              <textarea
                placeholder="Add description..."
                className="text-base outline-none border-none w-full pb-12"
                cols={3}
              />
            </div> */}

            <div className="flex flex-row gap-4">
              {props.primitiveFields.map((field) => {
                if (field.field?.type === 'Boolean') {
                  // TODO: HIER WEITER MACHEN
                  // cannot use projects -> need to get projectId
                  // prioty -> dfault value
                  // extract into own components

                  console.log(field.field);
                  return (
                    <div className="flex flex-row gap-2 items-center text-sm">
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
              })}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center gap-2">
                {props.complexFields.map((f) => {
                  return (
                    <button
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
                  Create Issue
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
