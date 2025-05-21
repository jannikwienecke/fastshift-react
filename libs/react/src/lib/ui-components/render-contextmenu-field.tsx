import {
  FieldConfig,
  getEditLabel,
  Row,
  useTranslation,
} from '@apps-next/core';
import { getComponent } from './ui-components.helper';
import { store$ } from '../legend-store';
import { getViewConfigManager } from '../legend-store/legend.utils';

export const ContextmenuFieldLabel = ({
  value,
  field,
}: {
  field?: FieldConfig | null;
  value: Row;
}) => {
  const { t } = useTranslation();

  const ComponentToRender =
    field &&
    getComponent({
      componentType: 'contextmenuFieldItem',
      fieldName: field.name,
      isDetail: false,
    });

  if (field && field.type === 'Boolean')
    return (
      <>
        {getEditLabel(
          field,
          getViewConfigManager().viewConfig,
          store$.contextMenuState.row.get() as Row | undefined
        )}
      </>
    );

  if (!field || !ComponentToRender) return <>{value.label.firstUpper()}</>;

  return (
    <>
      <ComponentToRender field={field} />
    </>
  );
};
