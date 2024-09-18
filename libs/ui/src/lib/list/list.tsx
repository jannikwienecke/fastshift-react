import React from 'react';
import { Checkbox } from '../components/checkbox';
import { cn } from '../utils';
import { ListItem, ListProps, ListValueProps } from '@apps-next/core';

export function ListDefault<TItem extends ListItem = ListItem>({
  items,
  onSelect,
  selected,
}: ListProps<TItem>) {
  return (
    <List onSelect={onSelect} selected={selected}>
      {items.map((item) => {
        return (
          <List.Item key={item.id} className="" item={item}>
            <div className="flex gap-1 pr-2">
              <List.Control />
              <List.Icon icon={item?.icon} />
            </div>

            <List.Values>
              <ListValues values={item.valuesLeft} />
              <ListValues values={item.valuesRight} />
            </List.Values>
          </List.Item>
        );
      })}
    </List>
  );
}

const ListContext = React.createContext<
  Pick<ListProps<any>, 'onSelect' | 'selected'>
>({} as Pick<ListProps<any>, 'onSelect' | 'selected'>);
const ListProvider = ListContext.Provider;

export function List<TItem extends ListItem = ListItem>({
  children,
  onSelect,
  selected,
}: { children: React.ReactNode } & {
  onSelect: ListProps<TItem>['onSelect'];
  selected: ListProps<TItem>['selected'];
}) {
  return (
    <ListProvider value={{ onSelect, selected }}>
      <div className="flex flex-col w-full border-collapse overflow-scroll grow">
        {children}
      </div>
    </ListProvider>
  );
}

export function ListControl() {
  const { selected, onSelect } = React.useContext(ListContext);
  const { item } = React.useContext(ItemContext);

  const isSelected = selected?.map((i) => i.id).includes(item.id);
  return (
    <div
      className={cn(
        'px-1 opacity-0 hover:opacity-100 transition-all grid place-items-center',
        isSelected ? 'opacity-100' : ''
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => {
          onSelect?.(item);
        }}
      />
    </div>
  );
}

const ItemContext = React.createContext<{ item: ListItem }>(
  {} as { item: ListItem }
);
const ItemProvider = ItemContext.Provider;

function Item(
  props: React.ComponentPropsWithoutRef<'li'> & {
    children: React.ReactNode;
    item: ListItem;
  }
) {
  const { children, className, item, ...restProps } = props;
  const { selected } = React.useContext(ListContext);

  const isSelected = selected?.map((i) => i.id).includes(item.id);

  return (
    <ItemProvider value={{ item }}>
      <li
        data-testid="list-item"
        className={cn(
          'flex flex-row py-[10px] pl-2 pr-4 w-full gap-2 border-b border-collapse border-[#f7f7f7]',
          isSelected ? 'bg-foreground/5  text-foreground' : 'hover:bg-slate-50',
          className
        )}
        {...restProps}
      >
        {children}
      </li>
    </ItemProvider>
  );
}

function ListIcon({
  icon: Icon,
  ...props
}: {
  icon?: React.FC<React.ComponentProps<'div'>>;
} & React.ComponentPropsWithoutRef<'div'>) {
  if (!Icon) return null;

  return (
    <div className="grid place-items-center text-muted-foreground">
      {Icon && <Icon {...props} />}
    </div>
  );
}

function ValuesWrapper({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'flex flex-row items-center gap-2 grow justify-between',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function Value({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { children: React.ReactNode }) {
  const { item } = React.useContext(ItemContext);
  const { selected } = React.useContext(ListContext);

  const isSelected = selected?.map((i) => i.id).includes(item.id);

  return (
    <div
      className={cn(
        'text-sm text-foreground/90 ',
        isSelected ? '' : 'hover:bg-slate-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ListValues({
  className,
  values,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  values: ListValueProps[];
}) {
  return (
    <>
      <div
        className={cn(
          'flex flex-row gap-2 items-center text-foreground/80',
          className
        )}
        {...props}
      >
        {values.map((value, index) => {
          return (
            <List.Value
              key={
                value.id + '_fieldName_' + value.relation?.fieldName ||
                'NO_VALUE' + (value.relation?.fieldName.toString() || '')
              }
            >
              <>{value.render ? value.render() : value.label}</>
            </List.Value>
          );
        })}
      </div>
    </>
  );
}

List.Item = Item;
List.Control = ListControl;
List.Values = ValuesWrapper;
List.ValuesLeft = ListValues;
List.ValuesRight = ListValues;
List.Value = Value;
List.Icon = ListIcon;
List.Default = ListDefault;
