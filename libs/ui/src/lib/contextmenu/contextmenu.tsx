import {
  ContextMenuFieldItem,
  ContextMenuUiOptions,
  renderModelName,
  Row,
  useTranslation,
} from '@apps-next/core';
import {
  CheckIcon,
  CopyIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '../components';
import { Checkbox } from '../components/checkbox';

// Components
const FieldIcon: React.FC<{ field: ContextMenuFieldItem }> = ({ field }) => {
  if (field.Icon) {
    return <field.Icon className="w-4 h-4" />;
  }
  return <PencilIcon className="w-3 h-3" />;
};

const MenuItemContent: React.FC<{
  field: ContextMenuFieldItem;
  renderField: (field: ContextMenuFieldItem) => React.ReactNode;
}> = ({ field, renderField }) => (
  <div className="w-full flex flex-row items-center">
    <div className="pr-2">
      <FieldIcon field={field} />
    </div>
    {renderField(field)}
    <ContextMenuShortcut>
      ⌘{field.name.slice(0, 1).toUpperCase()}
    </ContextMenuShortcut>
  </div>
);

const SubMenuContent: React.FC<{
  field: ContextMenuFieldItem;
  renderOption: (row: Row, field: ContextMenuFieldItem) => React.ReactNode;
}> = ({ field, renderOption }) => {
  const { t } = useTranslation();
  const isManyToMany = field.relation?.manyToManyTable;

  return (
    <ContextMenuSubContent className="w-48">
      {field.relation && (
        <>
          <input
            type="text"
            placeholder="Filter..."
            onClick={(e) => e.stopPropagation()}
            className="text-sm px-2 outline-none border-none w-full py-1"
          />
          <ContextMenuSeparator />
        </>
      )}

      {field.relation &&
      !field.relation.manyToManyTable &&
      field.noneOptionRow ? (
        <ContextMenuItem
          key={`noneoption-${field.noneOptionRow.id}`}
          className="group items-center flex flex-row"
          onClick={() =>
            field.noneOptionRow && field.onSelectOption?.(field.noneOptionRow)
          }
        >
          {field.selected?.length === 0 ? (
            <CheckIcon className="w-4 h-4 mr-1" />
          ) : (
            <div className="h-4 w-4 mr-1" />
          )}
          <div>{renderOption(field.noneOptionRow, field)}</div>
        </ContextMenuItem>
      ) : null}

      {field.selected?.map((row) => (
        <ContextMenuItem
          key={`selected-${row.id}`}
          className="group items-center flex flex-row"
        >
          {isManyToMany ? (
            <div className="pr-2 grid place-items-center">
              <Checkbox
                onClick={(e) => e.stopPropagation()}
                onCheckedChange={() => field.onCheckOption?.(row)}
                checked
                className="h-4 w-4"
              />
            </div>
          ) : (
            <CheckIcon className="w-4 h-4 mr-1" />
          )}
          <div>{renderOption(row, field)}</div>
        </ContextMenuItem>
      ))}

      {field.options?.map((row) => (
        <ContextMenuItem
          key={`option-${row.id}`}
          className="group"
          onClick={() => field.onSelectOption?.(row)}
        >
          {isManyToMany ? (
            <div className="invisible group-hover:visible pr-2">
              <Checkbox
                onClick={(e) => e.stopPropagation()}
                onCheckedChange={() => field.onCheckOption?.(row)}
                className="h-4 w-4"
              />
            </div>
          ) : (
            <div className="h-4 w-4 mr-1" />
          )}
          <div>{renderOption(row, field)}</div>
        </ContextMenuItem>
      ))}

      {field.relation && (
        <>
          <ContextMenuSeparator />

          <ContextMenuItem className="">
            <div className="h-4 w-4 mr-1" />
            <div className="flex flex-row items-center gap-2">
              <PlusIcon
                className="text-foreground/50 w-4 h-4 mr-0"
                strokeWidth={3}
              />

              {/* <div className="flex-1">Create new {field.name}</div> */}
              <div className="flex-1">
                {t('common.createNew', {
                  name: renderModelName(field.name, t),
                })}
              </div>
            </div>
          </ContextMenuItem>
        </>
      )}
    </ContextMenuSubContent>
  );
};

export const ContextMenuDefault = ({
  rect,
  isOpen,
  onClose,
  fields,
  renderField,
  renderOption,
  modelName,
  ...props
}: ContextMenuUiOptions) => {
  const ref = useRef<HTMLDivElement>(null);
  const [canBeClosed, setCanBeClosed] = useState(false);

  const { t } = useTranslation();

  useLayoutEffect(() => {
    if (!rect) return;
    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: rect.left,
      clientY: rect.y,
    });
    ref.current?.dispatchEvent(event);
  }, [rect]);

  useEffect(() => {
    if (!isOpen) {
      setCanBeClosed(false);
      return;
    }

    const timer = setTimeout(() => setCanBeClosed(true), 700);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <ContextMenu
      modal={true}
      onOpenChange={(open) => {
        !open && canBeClosed && onClose();
      }}
    >
      <ContextMenuTrigger ref={ref} className="w-0 h-0 invisible sr-only" />

      <ContextMenuContent className="w-56">
        {fields?.map((field) => {
          const isEnumOrRelationalField = field.enum || field.relation;

          if (!isEnumOrRelationalField) {
            return (
              <ContextMenuItem key={field.name}>
                <MenuItemContent field={field} renderField={renderField} />
              </ContextMenuItem>
            );
          }

          return (
            <ContextMenuSub key={field.name}>
              <ContextMenuSubTrigger className="w-full">
                <MenuItemContent field={field} renderField={renderField} />
              </ContextMenuSubTrigger>

              <SubMenuContent field={field} renderOption={renderOption} />
            </ContextMenuSub>
          );
        })}

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <div className="flex flex-row items-center">
              <div className="pr-2">
                <CopyIcon className="w-3 h-3" />
              </div>
              <div>{t('common.copy')}</div>
            </div>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>
              Copy ID
              <ContextMenuShortcut>⌘.</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>Copy URL</ContextMenuItem>
            <ContextMenuItem>Copy as JSON</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {!props.isDeleted ? (
          <ContextMenuItem>
            <div className="flex flex-row items-center">
              <div className="pr-2">
                <TrashIcon className="w-3 h-3" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  props.onDelete();
                }}
              >
                {t('common.delete', { name: renderModelName(modelName, t) })}
              </button>
            </div>
            <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
          </ContextMenuItem>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
};
