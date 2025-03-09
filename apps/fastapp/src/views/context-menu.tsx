import { Icon, makeHooks, useView } from '@apps-next/react';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@apps-next/ui';
import React from 'react';
import Fuse from 'fuse.js';
import { RecordType } from '@apps-next/core';

export function ContextMenuDemo({ rect }: { rect: DOMRect | null }) {
  const { viewConfigManager } = useView();
  const { useQueryData } = makeHooks<RecordType>();

  const { relationalDataModel } = useQueryData();
  console.log('relationalDataModel', relationalDataModel);

  const fields = viewConfigManager
    .getViewFieldList()
    .filter((f) => f.relation || f.enum);
  const [query, setQuery] = React.useState('');
  console.log('fields', fields);

  const ref = React.useRef<HTMLDivElement>(null);

  const fuse = React.useMemo(() => {
    return new Fuse(fields, {
      keys: ['name'],
      threshold: 0.3,
    });
  }, [fields]);

  const results = React.useMemo(() => {
    if (!query) return fields;
    const result = fuse.search(query);
    return result.map((r) => r.item);
  }, [query, fields, fuse]);

  console.log('results', results);

  const inptutRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    setTimeout(() => {
      inptutRef.current?.focus();
    }, 1);
  }, [query]);

  React.useLayoutEffect(() => {
    if (!rect) return;
    //   manually fire a right click event
    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: rect.left + 50,
      clientY: rect.top + 20,
    });
    ref.current?.dispatchEvent(event);
  }, [rect]);

  if (rect) console.log(rect?.top + rect.height);
  return (
    <ContextMenu modal={true}>
      <ContextMenuTrigger
        ref={ref}
        className="w-0 h-0 invisible"
      ></ContextMenuTrigger>

      <ContextMenuContent className="w-56">
        {/* Input field in context menu */}
        {/* <ContextMenuItem className="p-0 m-0"> */}
        <input
          ref={inptutRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter..."
          onClick={(e) => e.stopPropagation()}
          className="text-sm px-2 outline-none border-none w-full py-1"
          // autoFocus
          tabIndex={-1}
        />
        {/* </ContextMenuItem> */}

        <ContextMenuSeparator />

        {results.map((field) => {
          const icon = viewConfigManager.viewConfig.icon;
          const relationalData = relationalDataModel[field.name];
          console.log(field.enum?.values);
          console.log('relationalData', relationalData);

          return (
            <ContextMenuSub key={field.name}>
              <ContextMenuSubTrigger className="w-full">
                <div className="w-full flex flex-row items-center">
                  <div className="pr-2">
                    <Icon icon={icon} />
                  </div>

                  {field.name.firstUpper()}

                  <ContextMenuShortcut>
                    ⌘{field.name.slice(0, 1).firstUpper()}
                  </ContextMenuShortcut>
                </div>
              </ContextMenuSubTrigger>

              <ContextMenuSubContent className="w-48">
                {field.enum ? (
                  <>
                    <input
                      type="text"
                      placeholder="Filter..."
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm px-2 outline-none border-none w-full py-1"
                    />
                    <ContextMenuSeparator />

                    {field.enum.values.map((value) => {
                      return (
                        <ContextMenuItem key={value.name}>
                          {value.name}
                        </ContextMenuItem>
                      );
                    })}
                  </>
                ) : null}

                {field.relation ? (
                  <>
                    <input
                      type="text"
                      placeholder="Filter..."
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm px-2 outline-none border-none w-full py-1"
                    />
                    <ContextMenuSeparator />

                    {relationalData?.rows.map((row) => {
                      return (
                        <ContextMenuItem key={row.id}>
                          {row.label}
                        </ContextMenuItem>
                      );
                    })}
                  </>
                ) : null}
              </ContextMenuSubContent>
            </ContextMenuSub>
          );
        })}

        <ContextMenuSeparator />

        <ContextMenuSub>
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
          <ContextMenuRadioItem value="pedro">
            Pedro Duarte
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
