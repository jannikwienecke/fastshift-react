import React from 'react';
import { Checkbox } from '../components/checkbox';
import { cn } from '../utils';

export type ListValueProps = {
  id: string | number;
  name: string;
  render: () => React.ReactNode;
};

export type ListItem = {
  id: string | number;
  icon?: () => React.ReactNode;
  valuesLeft: ListValueProps[];
  valuesRight: ListValueProps[];
};

export type ListProps<TItem extends ListItem = ListItem> = {
  items: TItem[];
  onSelect: (item: TItem) => void;
  selected: Record<string, any>[];
};

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
            <List.Control />

            <List.Icon icon={item?.icon} />

            <List.Values>
              <div className="flex flex-row gap-2 items-center">
                {item.valuesLeft.map((value) => (
                  <List.Value key={value.id}>
                    {value.render ? value.render() : value.name}
                  </List.Value>
                ))}
              </div>

              <div className="flex flex-row gap-2 items-center">
                {item.valuesRight.map((value) => (
                  <List.Value key={value.id}>
                    {value.render ? value.render() : value.name}
                  </List.Value>
                ))}
              </div>
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
      <div className="flex flex-col w-full border-collapse overflow-scroll ">
        {children}
      </div>
    </ListProvider>
  );
}

export function ListControl() {
  // CONTINUE HERE:
  // add icons to views/tables and show in the list - check!
  // handle check state of all items in list store - check!
  // handle when clicking on a relational field like user etc...
  // handle actions like delete, edit, etc...
  // - [ ] Add commandbar
  // - [ ] Click list edit field
  // - [ ] Add filter component
  // - [ ] Can be filter
  // - [ ] Can do pagination
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
        onCheckedChange={(checked: boolean) => {
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
        className={cn(
          'flex flex-row py-3 px-4 w-full gap-3 grow border-b border-collapse border-gray-200',
          isSelected
            ? 'bg-card-foreground/90  text-background'
            : 'hover:bg-slate-50',
          className
        )}
        {...restProps}
      >
        {children}
      </li>
    </ItemProvider>
  );
}

function ListIcon(props: { icon?: React.FC }) {
  if (!props.icon) return null;
  return (
    <div className="grid place-items-center">
      {props.icon && <props.icon />}
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
  return (
    <div className={cn('text-sm', className)} {...props}>
      {children}
    </div>
  );
}

List.Item = Item;
List.Control = ListControl;
List.Values = ValuesWrapper;
List.Value = Value;
List.Icon = ListIcon;
List.Default = ListDefault;
