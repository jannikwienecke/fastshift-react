import {
  BaseViewConfigManager,
  BaseViewConfigManagerInterface,
} from '../base-view-config';
import { relationalViewHelper } from '../relational-view.helper';
import { FieldType, ID, RecordType, RegisteredViews } from '../types';

type DataItemProps<T extends RecordType> = {
  value: T | DataItem<T>;
  type: FieldType;
  name: keyof T;
  label: string;
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
    return this.props.type;
  }

  get label() {
    return this.props.label;
  }
}

export class DataRow<TProps extends RecordType = RecordType> {
  private constructor(
    private props: TProps,
    private viewConfigManager: BaseViewConfigManagerInterface,
    private items: DataItem<TProps>[]
  ) {}

  static create<TProps extends RecordType>(
    props: TProps,
    viewConfigManager: BaseViewConfigManagerInterface,
    registeredViews: RegisteredViews
  ) {
    const items = viewConfigManager.getViewFieldList().map((field) => {
      let value = props?.[field.name];
      let label = value;

      const { fieldName, tableName } = field.relation || {};

      if (fieldName && tableName) {
        const { getDisplayFieldValue, relationalView } = relationalViewHelper(
          tableName,
          registeredViews
        );

        label = getDisplayFieldValue(props);

        value = value
          ? DataRow.create(
              value,
              new BaseViewConfigManager(relationalView),
              registeredViews
            )
          : DataItem.create({
              value: props?.[fieldName],
              type: field.type,
              name: field.name,
              label: getDisplayFieldValue(props) ?? props?.[fieldName],
            });

        return DataItem.create({
          value,
          label,
          type: field.type,
          name: field.name,
        });
      }

      return DataItem.create({
        value,
        label,
        type: field.type,
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
    const value = this.items.find((item) => item.name === name)?.value;
    if (typeof value === 'string') {
      return value;
    }

    if (value instanceof DataRow) {
      return value.label as TProps[TKey];
    }

    return '' as TProps[TKey];
  }

  getItemLabel(name: keyof TProps) {
    const item = this.items.find((item) => item.name === name);
    if (item) {
      return item.label.toString();
    }
    throw new Error(`Item with name ${String(name)} not found`);
  }

  getItemName(name: keyof TProps) {
    const item = this.items.find((item) => item.name === name);
    if (item) {
      return item.name.toString();
    }
    console.log({ name });

    throw new Error(`Item with name ${String(name)} not found`);
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

  getRows() {
    return this.rows;
  }
}
