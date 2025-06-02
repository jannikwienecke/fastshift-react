import {
  ComboxboxItem,
  FieldConfig,
  getViewByName,
  isSystemField,
  makeRow,
  makeRowFromValue,
  useTranslation,
  ViewConfigType,
} from '@apps-next/core';
import { useView } from '../use-view';
import { ComboboxFieldValue } from './render-combobox-field-value';
import { getComponent } from './ui-components.helper';
import { ClockIcon } from 'lucide-react';

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
        row={makeRowFromValue(props.value.id.toString(), selectedField)}
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

  let fallback = '';
  try {
    const field =
      selectedField ?? viewConfigManager.getFieldBy(props.value.id.toString());

    view = field.relation
      ? getViewByName(registeredViews, field.name)
      : undefined;

    const IconComponent = field
      ? getComponent({
          fieldName: field.name,
          componentType: 'icon',
          isDetail: false,
        })
      : undefined;

    name = field.label ?? field.name;
    Icon = IconComponent ?? view?.icon;

    if (isSystemField(field.name)) {
      Icon = ClockIcon;
    }

    fallback = field.name.firstUpper();
  } catch (error) {
    name = props.value.label;
    fallback = props.value.label;
    Icon = props.value.icon;
  }

  const translated = t(name as any);
  const toDisplay = translated.includes('returned an object instead of st')
    ? fallback
    : translated === name && translated.includes('.')
    ? fallback
    : translated;

  return (
    <div className="flex flex-row gap-2 items-center">
      <span className="h-3 w-3">
        {Icon && <Icon style={{ height: '12px', width: '12px' }} />}
      </span>
      <span>{toDisplay}</span>
    </div>
  );
};
