import { BaseViewConfigManagerInterface } from '../base-view-config';
import { relationalViewHelper } from '../relational-view.helper';
import { FieldConfig, ID, RecordType, RegisteredViews } from '../types';

type DataItemProps<T extends RecordType> = {
  value: T;
  field: FieldConfig;
  name: keyof T;
  label: string;
  id: string;
};
export class DataItem<T extends RecordType> {
  private constructor(private props: DataItemProps<T>) {}

  static create<T extends RecordType>(props: DataItemProps<T>) {
    return new DataItem(props);
  }

  get name() {
    return this.props.name;
  }

  get value() {
    return this.props.value;
  }

  get type() {
    return this.props.field.type;
  }

  get field() {
    return this.props.field;
  }

  get label() {
    return this.props.label;
  }

  get id(): string {
    return this.props.value?.id ?? this.value ?? '';
  }
}

export class DataRow<TProps extends RecordType = RecordType> {
  private constructor(
    public props: TProps,
    private viewConfigManager: BaseViewConfigManagerInterface,
    private items: DataItem<TProps>[]
  ) {}

  static create<TProps extends RecordType>(
    props: TProps,
    viewConfigManager: BaseViewConfigManagerInterface,
    registeredViews: RegisteredViews
  ) {
    const items = viewConfigManager.getViewFieldList().map((field) => {
      const value = props?.[field.name];
      let label = value;

      const { fieldName, tableName } = field.relation || {};

      if (fieldName && tableName) {
        const { getDisplayFieldValue } = relationalViewHelper(
          tableName,
          registeredViews
        );

        label = getDisplayFieldValue(props);
      }

      return DataItem.create({
        id: value?.id ?? value ?? '',
        value,
        label,
        field,
        name: field.name,
      });
    });

    return new DataRow(props, viewConfigManager, items);
  }

  get id(): ID {
    return this.props['id'];
  }

  get label(): string {
    return this.props[this.viewConfigManager.getDisplayFieldLabel()];
  }

  getRow() {
    return this.props;
  }

  getItems() {
    return this.items;
  }

  getItemValue<TKey extends keyof TProps>(name: TKey): TProps[TKey] {
    const item = this.items.find((item) => item.name === name);
    if (!item) {
      console.trace();
      console.log({ name, items: this.items });
      throw new Error(`getItemValue: Item with name ${String(name)} not found`);
    }

    return item.value as TProps[TKey];
  }

  getItemLabel(name: keyof TProps) {
    const item = this.items.find((item) => item.name === name);
    if (item && item.label !== undefined) {
      return item.label.toString();
    }
    throw new Error(`getItemLabel: Item with name ${String(name)} not found`);
  }

  getItemName(name: keyof TProps) {
    const item = this.items.find((item) => item.name === name);
    if (item) {
      return item.name.toString();
    }

    throw new Error(`getItemName: Item with name ${String(name)} not found`);
  }

  getItem(name: keyof TProps) {
    const item = this.items.find((item) => item.name === name);
    if (!item) {
      throw new Error(`getItem: Item with name ${String(name)} not found`);
    }
    return item;
  }

  updateItem<TKey extends keyof TProps>(name: TKey, value: DataItem<TProps>) {
    this.items = this.items.map((item) => {
      if (item.name === name) {
        return value;
      }
      return item;
    });
  }
}

export class Model<T extends RecordType> {
  private rows: DataRow<T>[];

  private constructor(
    private data: T[],
    private viewConfigManager: BaseViewConfigManagerInterface,
    private registeredViews: RegisteredViews
  ) {
    this.rows = data.map((item) =>
      DataRow.create(item, viewConfigManager, registeredViews)
    );
  }

  static create<T extends RecordType>(
    data: T[],
    viewConfigManager: BaseViewConfigManagerInterface,
    registeredViews: RegisteredViews
  ) {
    return new Model(data, viewConfigManager, registeredViews);
  }

  getRowById(id: ID) {
    return this.rows.find((row) => row.id === id);
  }

  getRows() {
    return this.rows;
  }
}
