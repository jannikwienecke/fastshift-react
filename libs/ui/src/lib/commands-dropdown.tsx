import { CommandsDropdownProps, t } from '@apps-next/core';
import { MoreHorizontal } from 'lucide-react';
import {
  Button,
  buttonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './components';
import { Checkbox } from './components/checkbox';
import { cn } from './utils';

export const CommandsDropdown = ({
  commands,
  onOpenCommands,
  onSelectCommand,
  children,
}: CommandsDropdownProps) => {
  const groupsWithItems = commands?.filter((c) => c.items.length > 0) ?? [];

  return (
    <DropdownMenu onOpenChange={onOpenCommands}>
      <DropdownMenuTrigger>
        {children ? (
          <div
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            {children}
          </div>
        ) : (
          <div>
            <MoreHorizontal className="text-foreground/50" />

            <span className="sr-only">{t('common.more')}</span>
          </div>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="rounded-lg text-sm px-2">
        {groupsWithItems?.map((group, index) => {
          let lastCommandType = '';

          const isLastGroup =
            index === groupsWithItems.length - 1 ||
            groupsWithItems.length === 1;

          return (
            <div key={index}>
              {group.items.map((item, index) => {
                const isDifferentCommandType =
                  lastCommandType && item.command !== lastCommandType;
                lastCommandType = item.command;
                const isLastCommandOfGroup = index === group.items.length - 1;

                return (
                  <div key={item.id.toString()}>
                    {!item.subCommands ? (
                      <DropdownMenuItem
                        key={item.label}
                        onClick={() => {
                          onSelectCommand?.(item);
                        }}
                      >
                        {item.icon ? (
                          <item.icon className="text-foreground" />
                        ) : null}

                        <span className="text-foreground text-[13px]">
                          {item.label}
                        </span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          {item.icon ? (
                            <item.icon className="text-foreground" />
                          ) : null}

                          <span className="text-foreground text-[13px]">
                            {item.label}
                          </span>
                        </DropdownMenuSubTrigger>

                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            {item.subCommands.map((subItem, index) => {
                              return (
                                <DropdownMenuItem
                                  key={subItem.id.toString() + index}
                                  onClick={(e) => {
                                    if (subItem.onCheckedChange) {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    } else {
                                      onSelectCommand?.(subItem);
                                    }
                                  }}
                                >
                                  {subItem.icon && !subItem.onCheckedChange ? (
                                    <subItem.icon className="text-foreground" />
                                  ) : (
                                    <>
                                      <Checkbox
                                        onCheckedChange={(checked) => {
                                          subItem.onCheckedChange?.(
                                            checked as boolean
                                          );
                                        }}
                                      />
                                    </>
                                  )}

                                  <span className="text-foreground text-[13px]">
                                    {subItem.label.toString()}
                                  </span>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    )}

                    {(item.dropdownOptions?.showDivider ||
                      isDifferentCommandType) &&
                    !isLastCommandOfGroup ? (
                      <>
                        <DropdownMenuSeparator />
                      </>
                    ) : null}
                  </div>
                );
              })}

              {!isLastGroup ? (
                <>
                  <DropdownMenuSeparator />
                </>
              ) : null}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
