import {
  ComboxboxItem,
  FieldConfig,
  getViewByName,
  makeRow,
  renderField,
  ViewConfigType,
} from '@apps-next/core';
import { useView } from '../use-view';
import { ComboboxFieldValue } from './render-combobox-field-value';
import { useTranslation } from 'react-i18next';

export const FilterValue = (props: {
  value: ComboxboxItem;
  field: FieldConfig | null;
}) => {
  const { t } = useTranslation();

  const { viewConfigManager, registeredViews } = useView();

  let name = '';
  let view: ViewConfigType | undefined;
  let Icon: React.FC<any> | undefined;

  const selectedField = props.field;

  if (selectedField) {
    return (
      <ComboboxFieldValue
        field={selectedField}
        value={makeRow(
          props.value.id.toString(),
          props.value.label,
          props.value.label,
          selectedField
        )}
      />
    );
  }

  try {
    const field =
      selectedField ?? viewConfigManager.getFieldBy(props.value.id.toString());

    view = field.relation
      ? getViewByName(registeredViews, field.name)
      : undefined;
    name = field.name.firstUpper();
    Icon = view?.icon;
  } catch (error) {
    name = props.value.label;
    Icon = props.value.icon;
  }

  return (
    <div className="flex flex-row gap-2 items-center">
      <span>{Icon && <Icon className="w-4 h-4" />}</span>

      <span>{renderField(name, t)}</span>
    </div>
  );
};
