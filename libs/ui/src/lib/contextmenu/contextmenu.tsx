import {
  ADD_NEW_OPTION,
  ContextMenuFieldItem,
  ContextMenuUiOptions,
  getFieldLabel,
  getTableLabel,
  makeRowFromValue,
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
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      field.onClickOption();
    }}
    className="w-full flex flex-row items-center"
  >
    <div className="pr-2">
      <FieldIcon field={field} />
    </div>
    {renderField(field)}
    <ContextMenuShortcut>
      ⌘{field.name.slice(0, 1).toUpperCase()}
    </ContextMenuShortcut>
  </button>
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
            placeholder={t('filter.button.placeholder')}
            onClick={(e) => {
              e.stopPropagation();
              field.onClickOption();
            }}
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

      {field.options?.map((row) => (
        <ContextMenuItem
          key={`option-${row.id}`}
          className="group"
          onClick={() => {
            if (isManyToMany) {
              field.onCheckOption?.(row);
            } else {
              field.onSelectOption?.(row);
            }
          }}
        >
          {isManyToMany ? (
            <div className=" group-hover:visible pr-2">
              <Checkbox
                checked={field.selected?.some((r) => r.id === row.id)}
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

          <ContextMenuItem
            className=""
            onClick={() => {
              field.onSelectOption?.(makeRowFromValue(ADD_NEW_OPTION, field));
            }}
          >
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

      <ContextMenuContent data-testid="contextmenu" className="w-64">
        {fields?.map((field) => {
          const isEnumDateOrRelationalField =
            field.enum || field.relation || field.isDateField;

          if (!isEnumDateOrRelationalField) {
            return (
              <ContextMenuItem key={field.name}>
                <MenuItemContent field={field} renderField={renderField} />
              </ContextMenuItem>
            );
          }

          return (
            <ContextMenuSub
              key={field.name}
              onOpenChange={() => {
                field.onHover?.();
              }}
            >
              <ContextMenuSubTrigger className="w-full">
                <div className="w-full">
                  <MenuItemContent field={field} renderField={renderField} />
                </div>
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
              <div>{t('common.copy', { name: getTableLabel(modelName) })}</div>
            </div>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                props.onCopy('id');
              }}
            >
              {t('copy.id')}
              <ContextMenuShortcut>⌘.</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                props.onCopy('url');
              }}
            >
              {t('copy.url')}
            </ContextMenuItem>
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                props.onCopy('json');
              }}
            >
              {t('copy.json')}
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {!props.isDeleted ? (
          <ContextMenuItem
            className="cursor-pointer"
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              props.onDelete();
            }}
          >
            {/* REFACTOR Important -> have kind of class that manages commands outside of the UI module. */}
            <div className="flex flex-row items-center">
              <div className="pr-2">
                <TrashIcon className="w-3 h-3" />
              </div>
              <div>
                {t('common.delete', { name: renderModelName(modelName, t) })}
              </div>
            </div>
            <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
          </ContextMenuItem>
        ) : null}

        <ContextMenuItem
          className="cursor-pointer"
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            props.onEdit();
          }}
        >
          <div className="flex flex-row items-center">
            <div className="pr-2">
              <PencilIcon className="w-3 h-3" />
            </div>
            <div>
              {t('common.editName', { name: renderModelName(modelName, t) })}
            </div>
          </div>
          <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
