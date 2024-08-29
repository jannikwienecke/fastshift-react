import React from 'react';
import { ComboxboxItem } from '../combobox';
import { ComboboxGetPropsOptions, ComboboxPopover } from '../combobox-popover';
import { Checkbox } from '../components/checkbox';
import { cn } from '../utils';
import { ListItem, ListProps, ListValueProps } from './list.types';

export function ListDefault<TItem extends ListItem = ListItem>({
  items,
  onSelect,
  selected,
  comboboxOptions,
}: ListProps<TItem>) {
  return (
    <List
      onSelect={onSelect}
      selected={selected}
      comboboxOptions={comboboxOptions}
    >
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

const ListCombobox = ({
  relation,
  value,
  id,
  children,
}: {
  id: string | number;
  relation: ListValueProps['relation'];
  value: ComboxboxItem;
  children: React.ReactNode;
}) => {
  const { comboboxOptions } = React.useContext(ListContext);

  if (!relation) throw new Error('Relation not found');

  const getProps = relation.useCombobox?.({
    fieldName: relation.tableName,
    selectedValue: value,
    connectedRecordId: id,
    name: relation.fieldName,
  });

  return (
    <ComboboxPopover {...getProps(comboboxOptions)}>{children}</ComboboxPopover>
  );
};

const ListContext = React.createContext<
  Pick<ListProps<any>, 'onSelect' | 'selected' | 'comboboxOptions'>
>({} as Pick<ListProps<any>, 'onSelect' | 'selected' | 'comboboxOptions'>);
const ListProvider = ListContext.Provider;

export function List<TItem extends ListItem = ListItem>({
  children,
  onSelect,
  selected,
  comboboxOptions,
}: { children: React.ReactNode } & {
  onSelect: ListProps<TItem>['onSelect'];
  selected: ListProps<TItem>['selected'];
  comboboxOptions?: ComboboxGetPropsOptions;
}) {
  return (
    <ListProvider value={{ onSelect, selected, comboboxOptions }}>
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
  const { item } = React.useContext(ItemContext);

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
          if (value.relation && value.relation.tableName !== 'project') {
            return (
              <ListCombobox
                key={value.id}
                id={item.id}
                relation={value.relation}
                value={value}
              >
                {value.render ? value.render() : value.label}
              </ListCombobox>
            );
          }

          return (
            <List.Value key={value.id}>
              {value.render ? value.render() : value.label}
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
List.Combobox = ListCombobox;

// CONTINUE HERE:
// add icons to views/tables and show in the list - check!
// handle check state of all items in list store - check!
// handle when clicking on a relational field like user etc... -> check!
// change the combobox placeholder text -> NEXT TO DOa -> Check!
// change icon color to more grayish and the relational field labels as well -> Check!
// make icons a bit smaller -> Check!
// left padding bit less in list item, padding top/bottom bit more in list item -> Check!

// make combobox work for
// - [ ] Add many to many fields
// - [ ] enum fields
// handle actions like delete, edit, etc... (... icon next to list show on hover -see linear)
// - [ ] Add commandbar
// - [ ] Click list edit field -> check!
// - [ ] Add filter component
// - [ ] Can be filter
// - [ ] Can do pagination
// two ways when clicking on a field
// 1. open a dropdown to update that field value -> DEFAULT -> check!
// 2. open the record behind that field -> CAN BE SELECTED IN THE CONFIG
