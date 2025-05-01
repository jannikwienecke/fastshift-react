import {
  BaseViewConfigManager,
  CommandformItem,
  DetailPageProps,
  getFieldLabel,
  getViewByName,
  makeData,
  RecordType,
} from '@apps-next/core';
import { viewRegistry } from './legend.app.registry';
import { store$ } from './legend.store';
import { detailFormHelper } from './legend.detailpage.helper';

const getDetailTabsFields = () => {
  return detailFormHelper()
    .getComplexFormFields()
    .filter(
      (f) =>
        (f.field.relation?.type === 'oneToOne' ||
          f.field.relation?.type === 'oneToMany') &&
        f.field.isList !== true
    );
};

export const detailTabsHelper = () => {
  const detailTabsFields = getDetailTabsFields();

  if (!store$.detail.activeTabField.get()) {
    store$.detail.activeTabField.set(detailTabsFields[0]);
  }

  const activeTabField = store$.detail.activeTabField.get();

  if (!activeTabField) return null;

  const activeTabViewConfig = getViewByName(
    store$.views.get(),
    activeTabField?.field?.name ?? ''
  );

  const row = store$.detail.row.raw.get()?.[
    activeTabField?.field?.name ?? ''
  ] as RecordType | undefined;

  if (!activeTabViewConfig) return null;
  if (!row) return null;

  const viewConfigManager = new BaseViewConfigManager(activeTabViewConfig);

  const viewFields =
    viewConfigManager
      ?.getViewFieldList?.()
      .filter((f) => f.hideFromForm !== true) ?? [];

  const { uiViewConfig } = viewRegistry.getView(
    viewConfigManager.getViewName()
  );

  const getAllPrimitiveFormFields = () => {
    return viewFields.map((field) => {
      const icon =
        uiViewConfig?.[viewConfigManager.getTableName()].fields?.[field.name]
          ?.component?.icon;

      const value = row ? row?.[field.name] : undefined;

      const label = getFieldLabel(field, true) ?? '';
      return {
        label,
        field,
        id: field.name,
        icon: icon ? icon : undefined,
        value: row ? value : undefined,
      } satisfies CommandformItem;
    });
  };

  const complexFields = viewFields
    .filter((f) => f.hideFromForm !== true)
    .filter((field) => field.relation || field.enum || field.type === 'Date');

  const getComplexFormFields = () => {
    return complexFields.map((field) => {
      const icon =
        uiViewConfig?.[viewConfigManager.getTableName()].fields?.[field.name]
          ?.component?.icon;

      let value = row ? row?.[field.name] : undefined;
      const label = Array.isArray(value) ? '' : value?.id ? value.label : value;

      const asRows =
        typeof value === 'object'
          ? makeData(
              store$.views.get(),
              field.name
            )(Array.isArray(value) ? value : [value]).rows
          : value;

      value = Array.isArray(value)
        ? asRows
        : Array.isArray(asRows)
        ? asRows[0]
        : value;

      return {
        id: field.name,
        label,
        icon: icon ? icon : undefined,
        field,
        value,
        rowValues: Array.isArray(value) ? value : undefined,
        rowValue: !Array.isArray(value) && value?.raw ? value : undefined,
      } satisfies CommandformItem;
    });
  };

  return {
    activeTabField,
    detailTabsFields,
    activeTabPrimitiveFields: getAllPrimitiveFormFields(),
    activeTabComplexFields: getComplexFormFields(),
  } satisfies Omit<DetailPageProps['tabs'], 'onSelectTab'>;
};
