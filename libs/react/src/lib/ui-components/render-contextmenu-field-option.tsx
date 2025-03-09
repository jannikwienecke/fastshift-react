import { FieldConfig, Row, useTranslation } from '@apps-next/core';
import { getComponent } from './ui-components.helper';
import { FilterValue } from './render-filter-value';

export const ContextmenuFieldOption = ({
  value,
  field,
}: {
  field?: FieldConfig | null;
  value: Row;
}) => {
  const { t } = useTranslation();

  const fieldName = field?.name;

  const componentType = 'contextmenu';
  let ComponentToRender: React.ComponentType<any> | undefined = undefined;

  if (fieldName) {
    ComponentToRender = getComponent({
      componentType,
      fieldName,
    });
  }

  if (!field) {
    return <FilterValue field={null} value={value} />;
  }

  const raw =
    field?.type === 'Boolean' && typeof value.raw === 'string'
      ? value.raw === 'true'
        ? true
        : false
      : value.raw;

  return (
    <>
      {ComponentToRender ? (
        <>
          <ComponentToRender data={raw} />
        </>
      ) : (
        <>{t(value.label as any)}</>
      )}
    </>
  );
};
