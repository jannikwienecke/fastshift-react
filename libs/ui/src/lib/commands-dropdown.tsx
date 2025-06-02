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
  return (
    <DropdownMenu onOpenChange={onOpenCommands}>
      <DropdownMenuTrigger asChild>
        <div>
          <MoreHorizontal className="text-foreground/50" />

          <span className="sr-only">{t('common.more')}</span>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 rounded-lg text-sm">
        {commands?.map((option, index) => {
          return (
            <div key={index}>
              {option.items.map((item) => {
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

                    {item.dropdownOptions?.showDivider ? (
                      <DropdownMenuSeparator />
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
