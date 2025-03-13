import { FieldConfig, Row } from '@apps-next/core';
import { RenderComponent } from './render-component';
import { FilterValue } from './render-filter-value';

export const ContextmenuFieldOption = ({
  value,
  field,
}: {
  field?: FieldConfig | null;
  value: Row;
}) => {
  const componentType = 'contextmenuFieldOption';

  if (!field) {
    return <FilterValue field={null} value={value} />;
  }

  return (
    <RenderComponent
      value={value}
      field={field}
      componentType={componentType}
    />
  );

  // const raw =
  //   field?.type === 'Boolean' && typeof value.raw === 'string'
  //     ? value.raw === 'true'
  //       ? true
  //       : false
  //     : value.raw;

  // return (
  //   <>
  //     {ComponentToRender ? (
  //       <>
  //         <ComponentToRender data={raw} />
  //       </>
  //     ) : (
  //       <>{t(value.label as any)}</>
  //     )}
  //   </>
  // );
};
