import {
  FormFieldProps,
  getFieldLabel,
  getViewByName,
  makeDayMonthString,
  Row,
  useTranslation,
} from '@apps-next/core';
import { BubbleItem, Label } from '@apps-next/ui';
import { CubeIcon } from '@radix-ui/react-icons';
import { store$ } from '../legend-store';
import { getComponent } from './ui-components.helper';

export const RenderDetailComplexValue = (props: FormFieldProps) => {
  const { t } = useTranslation();
  const field = props.field;
  const fieldConfig = field.field;

  if (!fieldConfig) return null;

  const FieldLabel = () => {
    return (
      <div className="text-foreground/70 pb-2">
        {getFieldLabel(fieldConfig)}
      </div>
    );
  };

  const renderSingleRelation = (value: Row) => {
    return <>{value?.label}</>;
  };

  const renderManyRelation = (value: Row[]) => {
    if (!value.length)
      return (
        <>{t('common.addMany', { field: getFieldLabel(fieldConfig, true) })}</>
      );
    return (
      <>
        {value.map((row, index) => (
          <BubbleItem
            color={fieldConfig.name === 'tags' ? row.raw.color : undefined}
            label={row.label}
            key={index}
          />
        ))}
      </>
    );
  };

  const renderDate = (value: number | undefined) => {
    if (!value)
      return (
        <>{t('common.setValue', { field: getFieldLabel(fieldConfig, true) })}</>
      );

    return <>{makeDayMonthString(new Date(value as number))}</>;
  };

  const renderEnum = (value: number | string | boolean | undefined) => {
    return <>{value}</>;
  };

  const Component = getComponent({
    fieldName: fieldConfig.name,
    componentType: 'detailValue',
    // TODO DETAIL BRANCHING
    isDetail: true,
  });

  const isRow = !!(props.field.value as Row | undefined)?.raw;
  const isManyRows = Array.isArray(props.field.value);
  const isDate = fieldConfig.isDateField;
  const isEnum = fieldConfig.enum;
  const value = field.value as Row | Row[] | string | number;

  const renderRow = isRow
    ? () => renderSingleRelation(value as Row)
    : isManyRows
    ? () => renderManyRelation(value as Row[])
    : isDate
    ? () => renderDate(value as number)
    : isEnum
    ? () => renderEnum(value as number)
    : null;

  const view = getViewByName(store$.views.get(), fieldConfig.name ?? '');
  const Icon = field.icon ?? view?.icon;

  if (props.tabFormField) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex flex-row gap-2 items-center pb-4">
          <>
            {props.field.icon ? (
              <props.field.icon className="h-3 w-3 text-foreground" />
            ) : null}
          </>

          <Label className="max-w-[16rem] min-w-[16rem]">
            {getFieldLabel(fieldConfig)}
          </Label>

          <button
            onClick={(e) =>
              props.onClick(
                field,
                e.currentTarget.getBoundingClientRect(),
                true
              )
            }
            className="cursor-pointer"
          >
            {Component ? (
              <>
                <Component data={store$.detail.row.get()?.raw} />
              </>
            ) : (
              <div className="text-sm flex flex-row items-center gap-2 flex-wrap">
                <div>
                  {Icon ? (
                    <Icon className="h-4 w-4" />
                  ) : (
                    <CubeIcon className="h-4 w-4 invisible" />
                  )}
                </div>

                {renderRow?.()}

                <div></div>
              </div>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="" key={`complex-field-${field.field?.name}`}>
        <FieldLabel />

        <button
          onClick={(e) =>
            props.onClick(field, e.currentTarget.getBoundingClientRect())
          }
          className="cursor-pointer"
        >
          {Component ? (
            <>
              <Component data={store$.detail.row.get()?.raw} />
            </>
          ) : (
            <div className="text-sm flex flex-row items-center gap-2 flex-wrap">
              <div>
                {Icon ? (
                  <Icon className="h-4 w-4" />
                ) : (
                  <CubeIcon className="h-4 w-4 invisible" />
                )}
              </div>

              {renderRow?.()}

              <div></div>
            </div>
          )}
        </button>
      </div>
    </>
  );
};
