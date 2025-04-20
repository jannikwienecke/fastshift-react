import {
  ComboxboxItem,
  FieldConfig,
  getViewByName,
  makeRow,
  makeRowFromValue,
  useTranslation,
  ViewConfigType,
} from '@apps-next/core';
import { useView } from '../use-view';
import { ComboboxFieldValue } from './render-combobox-field-value';

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

    name = field.label ?? field.name;
    Icon = view?.icon;
    fallback = field.name.firstUpper();
  } catch (error) {
    name = props.value.label;
    fallback = props.value.label;
    Icon = props.value.icon;
  }

  const translated = t(name as any);
  const toDisplay = translated.includes('returned an object instead of st')
    ? fallback
    : translated === name
    ? fallback
    : translated;

  console.log({ toDisplay, translated, name });
  return (
    <div className="flex flex-row gap-2 items-center">
      <span>{Icon && <Icon className="w-4 h-4" />}</span>
      <span>{toDisplay}</span>
    </div>
  );
};
