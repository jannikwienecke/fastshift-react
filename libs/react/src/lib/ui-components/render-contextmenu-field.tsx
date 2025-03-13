import { FieldConfig, Row, useTranslation } from '@apps-next/core';
import { RenderComponent } from './render-component';
import { getComponent } from './ui-components.helper';

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
    });

  if (!field || !ComponentToRender) return <>{value.label.firstUpper()}</>;

  return (
    <>
      <ComponentToRender field={field} />
    </>
  );
};
