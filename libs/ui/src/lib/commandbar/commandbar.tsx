import { ComboxboxItem, CommandbarProps } from '@apps-next/core';
import { DialogTitle } from '@radix-ui/react-dialog';
import React from 'react';
import { Dialog, DialogContent } from '../components';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../components/command';

export const CommandDialogInput = (props: {
  inputPlaceholder?: CommandbarProps['inputPlaceholder'];
  onInputChange: CommandbarProps['onInputChange'];
  query?: CommandbarProps['query'];
}) => {
  return (
    <CommandInput
      className="text-lg placeholder:text-foreground/50 "
      placeholder={props.inputPlaceholder || 'Type a command or search...'}
      onValueChange={props.onInputChange}
      value={props.query ?? ''}
    />
  );
};

export const CommandDialogItem = (props: ComboxboxItem) => {
  return (
    <CommandItem onSelect={() => console.log('onSelect')}>
      {props.icon && <props.icon />}
      <span>{props.label}</span>
    </CommandItem>
  );
};

export const CommandDialogList = (props: {
  itemGroups?: CommandbarProps['itemGroups'];
  renderItem: CommandbarProps['renderItem'];
}) => {
  return (
    <CommandList className="px-3 pb-3 flex flex-col pt-2">
      {props.itemGroups?.flatMap((group, index) => {
        const isLast = index === (props.itemGroups?.length ?? 0) - 1;
        return (
          <>
            {group.map((item) => {
              return (
                <CommandItem
                  key={item.id.toString()}
                  onSelect={() => console.log('onSelect')}
                >
                  {props.renderItem(item)}
                </CommandItem>
              );
            })}
            {!isLast && (
              <div className="py-1">
                <CommandSeparator />
              </div>
            )}
          </>
        );
      })}

      <CommandEmpty>No results found.</CommandEmpty>
    </CommandList>
  );
};

export function CommandDialogDefault(props: CommandbarProps | undefined) {
  const onOpenRef = React.useRef(props?.onOpen);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenRef.current?.();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!props || !props.open) return null;
  if (!props) return;
  return (
    <>
      <Dialog
        {...props}
        open={props.open}
        onOpenChange={(open) => !open && props.onClose?.()}
      >
        <DialogContent className="overflow-hidden p-0 rounded-md">
          <DialogTitle className="sr-only">CommandbarDialog</DialogTitle>
          <Command
            shouldFilter={false}
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
          >
            <div className="px-4 pt-4 pb-1">
              <div className="text-sm p-1 bg-slate-50 w-max px-2 shadow-sm rounded-sm font-light">
                {props.headerLabel ?? ''}
              </div>
            </div>

            <CommandDialogInput {...props} />

            <CommandDialogList
              renderItem={props.renderItem}
              itemGroups={props.itemGroups}
            />
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const commandbar = {
  default: CommandDialogDefault,
  item: CommandDialogItem,
};
