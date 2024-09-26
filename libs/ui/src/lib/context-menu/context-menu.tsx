import { ContextMenuProps } from '@apps-next/core';
import { SearchIcon } from 'lucide-react';
import {
  ContextMenuItem,
  ContextMenuContent,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenu as ContextMenuUI,
} from '../components/context-menu';

export const ContextMenuDefault = (props: ContextMenuProps) => {
  return (
    <ContextMenuContent className="w-48 py-2">
      {props.items.map((item) => {
        return (
          <div className="w-full" key={item.id}>
            {item.options ? (
              <ContextMenuSub>
                <ContextMenuSubTrigger className="w-full">
                  <div className="flex gap-2 items-center flex-row justify-between w-full">
                    <div className="flex gap-2 items-center grow">
                      <ContextMenu.Icon icon={item.icon} />

                      <ContextMenu.Label label={item.label.firstUpper()} />
                    </div>

                    <div className="pr-2">
                      <ContextMenu.Shortcut shortcut={item.shortcut} />
                    </div>
                  </div>
                </ContextMenuSubTrigger>

                <ContextMenuSubContent className="w-48">
                  <ContextMenu.SearchItem
                    onClick={() => {
                      item.onClick();
                    }}
                    label="Search"
                  />

                  <ContextMenu.SubList options={item.options} />
                </ContextMenuSubContent>
              </ContextMenuSub>
            ) : (
              <ContextMenuItem
                onSelect={() => {
                  console.log('item.onClick');
                  item.onClick();
                }}
              >
                <div className="flex gap-2">
                  <ContextMenu.Icon icon={item.icon} />

                  <ContextMenu.Label label={item.label.firstUpper()} />
                </div>

                <ContextMenu.Shortcut shortcut={item.shortcut} />
              </ContextMenuItem>
            )}
          </div>
        );
      })}

      {/* <ContextMenuSub>
        <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>

        <ContextMenuSubContent className="w-48">
          <ContextMenuItem>
            Save Page As...
            <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>Create Shortcut...</ContextMenuItem>
          <ContextMenuItem>Name Window...</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Developer Tools</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSeparator />

      <ContextMenuCheckboxItem checked>
        Show Bookmarks Bar
        <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
      </ContextMenuCheckboxItem>

      <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>

      <ContextMenuSeparator />

      <ContextMenuRadioGroup value="pedro">
        <ContextMenuLabel inset>People</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
        <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
      </ContextMenuRadioGroup> */}
    </ContextMenuContent>
  );
};

export const Trigger = ContextMenuTrigger;

const Icon = (props: { icon?: React.FC }) => {
  return (
    <>
      {props.icon ? (
        <div className="w-6">
          <props.icon />
        </div>
      ) : (
        <div className="w-6"></div>
      )}
    </>
  );
};

const Label = (props: { label: string }) => {
  return <div className="text-foreground/70">{props.label}</div>;
};

const Shortcut = (props: { shortcut?: string }) => {
  return <ContextMenuShortcut>{props.shortcut}</ContextMenuShortcut>;
};

const SearchItem = (props: { label: string; onClick: () => void }) => {
  return (
    <ContextMenuItem
      className="cursor-pointer border-b border-gray-100 pb-1"
      onSelect={props.onClick}
    >
      <div className="flex items-center gap-2 border-gray-100 cursor-pointer w-full">
        <div>
          <SearchIcon className="w-4 h-4" />
        </div>
        <div>{props.label}</div>
      </div>
    </ContextMenuItem>
  );
};

const SubList = (props: {
  options: ContextMenuProps['items'][0]['options'];
}) => {
  return (
    <>
      {props.options?.map((option) => {
        return (
          <ContextMenuItem key={option.id}>{option.render()}</ContextMenuItem>
        );
      })}
    </>
  );
};

export const ContextMenu = {
  Default: ContextMenuDefault,
  Trigger: ContextMenuTrigger,
  Context: ContextMenuUI,
  Icon: Icon,
  Label: Label,
  Shortcut: Shortcut,
  SearchItem: SearchItem,
  SubList: SubList,
};
