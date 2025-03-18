import { ComponentType } from '@apps-next/core';
import { store$ } from '../legend-store';

export const getComponent = ({
  fieldName,
  componentType,
}: {
  fieldName: string;
  componentType: ComponentType;
}) => {
  return store$.uiViewConfig.get()?.[
    store$.viewConfigManager.get().getTableName?.()
  ]?.fields?.[fieldName]?.component?.[componentType];
};
