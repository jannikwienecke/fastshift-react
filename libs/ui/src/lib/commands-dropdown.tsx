import { MoreHorizontal } from 'lucide-react';
import {
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
import { CommandsDropdownProps, t } from '@apps-next/core';
import { Checkbox } from './components/checkbox';

export const CommandsDropdown = ({
  commands,
  onOpenCommands,
  onSelectCommand,
}: CommandsDropdownProps) => {
  const groupsWithItems = commands?.filter((c) => c.items.length > 0);
  return (
    <DropdownMenu onOpenChange={onOpenCommands}>
      <DropdownMenuTrigger asChild>
        <div>
          <MoreHorizontal className="text-foreground/50" />

          <span className="sr-only">{t('common.more')}</span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="rounded-lg text-sm px-2">
        {groupsWithItems.map((option, index) => {
          let lastCommandType = '';

          const isLast = index === groupsWithItems.length - 1;
          return (
            <div key={index}>
              {option.items.map((item) => {
                const isDifferentCommandType =
                  lastCommandType && item.command !== lastCommandType;
                lastCommandType = item.command;
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

                    {item.dropdownOptions?.showDivider ||
                    isDifferentCommandType ? (
                      <DropdownMenuSeparator />
                    ) : null}
                  </div>
                );
              })}

              {!isLast ? (
                <>
                  <DropdownMenuSeparator />
                  helo
                </>
              ) : null}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
