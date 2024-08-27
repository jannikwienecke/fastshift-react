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
  valuesLeft: ListValueProps[];
  valuesRight: ListValueProps[];
};

export type ListProps<TItem extends ListItem = ListItem> = {
  items: TItem[];
  onEdit?: (item: TItem) => void;
};

export function ListDefault<TItem extends ListItem = ListItem>({
  items,
}: ListProps<TItem>) {
  return (
    <List>
      {items.map((item) => {
        return (
          <List.Item key={item.id} className="">
            <List.Control />

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

export function List({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full border-collapse overflow-scroll ">
      {children}
    </div>
  );
}

export function ListControl() {
  // CONTINUE HERE:
  // add icons to views/tables and show in the list
  // handle check state of all items in list store
  // handle when clicking on a relational field like user etc...
  // handle actions like delete, edit, etc...
  const [selected, setSelected] = React.useState(false);
  return (
    <div
      className={cn(
        'invisible group-hover:visible transition-all grid place-items-center',
        selected ? 'visible' : 'invisible'
      )}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={(checked: boolean) => {
          setSelected(checked);
        }}
      />
    </div>
  );
}

function Item(
  props: React.ComponentPropsWithoutRef<'li'> & { children: React.ReactNode }
) {
  const { children, className, ...restProps } = props;
  return (
    <li
      className={cn(
        'flex flex-row py-3 px-4 w-full gap-3 grow border-b border-collapse border-gray-200 hover:bg-slate-50',
        className
      )}
      {...restProps}
    >
      {children}
    </li>
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
List.Default = ListDefault;
