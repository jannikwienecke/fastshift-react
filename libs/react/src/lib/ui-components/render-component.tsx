import {
  ComponentType,
  FieldConfig,
  Row,
  useTranslation,
} from '@apps-next/core';
import { getComponent } from './ui-components.helper';
import { FilterValue } from './render-filter-value';

export const RenderComponent = ({
  value,
  field,
  componentType,
}: {
  field?: FieldConfig | null;
  value: Row;
  componentType: ComponentType;
}) => {
  const { t } = useTranslation();

  const fieldName = field?.name;

  let ComponentToRender: React.ComponentType<any> | undefined = undefined;

  if (fieldName) {
    ComponentToRender = getComponent({
      componentType,
      fieldName,
    });
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
