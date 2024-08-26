import { IconDots } from '@tabler/icons-react';
import React from 'react';

export type ListItem = {
  id: string | number;
  valuesLeft: {
    id: string | number;
    name: string;
    render: () => React.ReactNode;
  }[];
  valuesRight: {
    id: string | number;
    name: string;
    render: () => React.ReactNode;
  }[];
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
          <List.Item key={item.id}>
            <List.Control />

            <List.Values>
              <div className="flex flex-row gap-2 items-center">
                {item.valuesLeft.map((value) => (
                  <List.Value key={value.id}>{value.render()}</List.Value>
                ))}
              </div>

              <div className="flex flex-row gap-2 items-center">
                {item.valuesRight.map((value) => (
                  <List.Value key={value.id}>{value.render()}</List.Value>
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
    <div className="flex flex-col w-full border-collapse overflow-scroll grow ">
      {children}
    </div>
  );
}

export function ListControl() {
  return (
    <div className="flex flex-row gap-1 items-center group">
      <div>
        <input className="invisible group-hover:visible" type="checkbox" />
      </div>
      <div>
        <IconDots className="h-4 w-4 text-gray-500" />
      </div>
    </div>
  );
}

function Item(
  props: React.ComponentPropsWithoutRef<'li'> & { children: React.ReactNode }
) {
  const { children, ...restProps } = props;
  return (
    <li
      className="flex flex-row py-3 px-4 w-full gap-3 grow border-b border-collapse border-gray-200 hover:bg-slate-50"
      {...restProps}
    >
      {children}
    </li>
  );
}

function ValuesWrapper(
  props: React.ComponentPropsWithoutRef<'div'> & { children: React.ReactNode }
) {
  return (
    <div
      className="flex flex-row items-center gap-2 grow justify-between"
      {...props}
    >
      {props.children}
    </div>
  );
}

function Value(
  props: React.ComponentPropsWithoutRef<'div'> & { children: React.ReactNode }
) {
  return (
    <div className="text-sm" {...props}>
      {props.children}
    </div>
  );
}

List.Item = Item;
List.Control = ListControl;
List.Values = ValuesWrapper;
List.Value = Value;
List.Default = ListDefault;
