import { BaseViewConfigManager } from './base-view-config';
import { RecordType, RegisteredViews } from './types';

export const relationalViewHelper = (
  relationalTableName: string,
  views: RegisteredViews
) => {
  const getRelationalView = (relationalTableName: string) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const relationalView = views[relationalTableName];

    if (!relationalView) {
      throw new Error(
        `relationalViewHelper: view not found for ${relationalTableName}`
      );
    }

    return relationalView;
  };

  const relationalView = getRelationalView(relationalTableName);

  const baseViewConfigManger = new BaseViewConfigManager(relationalView);
  return {
    all: views,
    relationalView,
    baseViewConfigManger,
    displayField: baseViewConfigManger.getDisplayFieldLabel(),
    getDisplayFieldValue: (row: RecordType) => {
      const value = row?.[relationalTableName];

      const relationalValue =
        value?.[baseViewConfigManger.getDisplayFieldLabel()];

      if (Array.isArray(value)) {
        return value
          .map((item) => item[baseViewConfigManger.getDisplayFieldLabel()])
          .join(', ');
      }

      if (!relationalValue && value && !(value && Array.isArray(value))) {
        throw new Error(
          `relationalViewHelper: display field value not found for ${relationalTableName}`
        );
      }
      return relationalValue;
    },
  };
};
