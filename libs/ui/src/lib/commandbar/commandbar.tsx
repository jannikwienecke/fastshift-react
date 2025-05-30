import { CommandbarProps } from '@apps-next/core';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useCommandState } from 'cmdk';
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
import { CommandRenderErrors } from '../render-errors-command';
import { cn } from '../utils';

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

export const CommandDialogList = (props: {
  groups: CommandbarProps['groups'];
  renderItem: CommandbarProps['renderItem'];
  onSelect: CommandbarProps['onSelect'];
  onValueChange: CommandbarProps['onValueChange'];
  row?: CommandbarProps['row'];
  query?: CommandbarProps['query'];
  activeItem?: CommandbarProps['activeItem'];
}) => {
  // const state = useCommandState((state) => state.value);

  const listRef = React.useRef<HTMLDivElement>(null);

  const onValueChangeRef = React.useRef(props.onValueChange);
  const groupsRef = React.useRef(props.groups);
  React.useEffect(() => {
    groupsRef.current = props.groups;
  }, [props.groups]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // if is down arrow, focus next item
      const activeId = props.activeItem?.id;
      const index = groupsRef.current
        .flat()
        .map((g) => g.items)
        .flat()
        .findIndex((i) => i.id === activeId);

      let newIndex = index;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        newIndex = index + 1;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        newIndex = index - 1;
      } else if (e.key === 'Enter' && props.activeItem) {
        e.preventDefault();
        props.onSelect?.(props.activeItem);
      }

      const item = groupsRef.current.map((g) => g.items).flat()?.[
        Number(newIndex)
      ];

      // console.log('item', item, newIndex);

      item && onValueChangeRef.current(item);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [props.activeItem?.id]);

  const prevIdKey = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!props.activeItem) return;

    const item = groupsRef.current
      .map((g) => g?.items)
      .flat()
      .find((i) => props.activeItem?.id === i.id);

    if (item) {
      onValueChangeRef.current(item);
    }

    // Scroll to top whenever value changes
  }, [props.activeItem]);

  React.useEffect(() => {
    const firstGroup = groupsRef.current?.[0];
    const newKey = firstGroup?.items.map((i) => i.id).join(',');

    if (newKey === prevIdKey.current) {
      return;
    }

    prevIdKey.current = newKey;

    onValueChangeRef.current(groupsRef.current[0]?.items[0]);
  }, [props.groups]);

  React.useLayoutEffect(() => {
    if (props.query === '') {
      setTimeout(() => {
        listRef.current?.scrollTo({ top: 0, behavior: 'instant' });
      }, 10);
    }
  }, [props.query]);

  return (
    <CommandList ref={listRef} className="px-3 pb-3 flex flex-col pt-2">
      {props.groups?.flatMap((group, index) => {
        // const isLast = index === (props.itemGroups?.length ?? 0) - 1;
        const isLast = false;

        const groupLabel = group.header;

        return (
          <div key={`group-${index}`}>
            {groupLabel ? (
              <div className="px-2 pt-2 pb-1 text-[13px] text-muted-foreground">
                {groupLabel}
              </div>
            ) : null}

            {group.items.map((item, index) => {
              // const active = props.activeItem?.id === item.id;
              const active = !!props.activeItem?.label?.includes(
                item.label.toString()
              );

              if (!item) return null;
              return (
                <CommandItem
                  key={item.id.toString()}
                  className={cn(
                    'text-[13px] text-foreground/90 p-0 pt-0 pb-0',
                    active && 'bg-foreground/5'
                  )}
                  style={{ padding: 0, margin: 0 }}
                >
                  <div
                    className="p-0 m-0 h-full w-full px-1 py-3"
                    onMouseOver={() => {
                      props.onValueChange?.(item);
                    }}
                    onClick={() => {
                      console.log('onClick item', item);
                      props.onSelect?.(item);
                    }}
                  >
                    {props.renderItem(item, active, index, props.row)}
                  </div>
                </CommandItem>
              );
            })}
            {!isLast && (
              <div className="py-1">
                <CommandSeparator className="bg-foreground/5 " />
              </div>
            )}
          </div>
        );
      })}

      <CommandEmpty>No results found.</CommandEmpty>
    </CommandList>
  );
};

const CommandbarContainer = (
  props: (CommandbarProps & { children: React.ReactNode }) | undefined
) => {
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

  // if the user click a number, handle props.onSelect event
  const onSelectRef = React.useRef(props?.onSelect);
  React.useEffect(() => {
    onSelectRef.current = props?.onSelect;
  }, [props?.onSelect]);

  React.useEffect(() => {
    const up = (e: KeyboardEvent) => {
      const key = e.key;
      const isSpace = key === ' ';
      const isNumber = key?.length === 1 && !isNaN(Number(key)) && !isSpace;

      if (isNumber || isSpace) {
        e.preventDefault();
        e.stopPropagation();
        onSelectRef.current?.({ id: 'key-press', label: key });
      }
    };

    document.addEventListener('keyup', up);
    return () => document.removeEventListener('keyup', up);
  }, []);

  if (!props || !props.open) return null;
  if (!props) return;

  return (
    <Dialog
      {...props}
      open={props.open}
      onOpenChange={(open) => !open && props.onClose?.()}
    >
      <DialogContent
        className="overflow-hidden p-0 rounded-md"
        data-testid="commandbar"
      >
        <DialogTitle className="sr-only">Commandbar Dialog</DialogTitle>
        {props.children}
      </DialogContent>
    </Dialog>
  );
};

export function CommandDialogDefault(props: CommandbarProps | undefined) {
  if (!props) return null;

  return (
    <>
      <CommandbarContainer {...props}>
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

          <CommandDialogList {...props} />

          <div className="px-4 pb-2">
            <CommandRenderErrors
              errors={[props.error?.message ?? '']}
              showError={props.error?.showError ?? false}
            />
          </div>
        </Command>
      </CommandbarContainer>
    </>
  );
}

export const commandbar = {
  default: CommandDialogDefault,
};
