import { BaseViewConfigManager } from './base-view-config';
import {
  parseDisplayOptionsStringForServer,
  parseFilterStringForServer,
} from './core-utils';
import { ViewConfigType, DisplayOptionsType, UserViewData } from './types';
import { FilterType, DisplayOptionsUiType } from './types/filter.types';

const keys = [
  'grouping',
  'sorting',
  'showDeleted',
  'viewType',
  'showEmptyGroups',
  'selectedViewFields',
] as const;

export const configManager = (viewConfig: ViewConfigType) => {
  const viewConfigManager = new BaseViewConfigManager(viewConfig);

  const mergeViewConfigWithUserViewData = (
    viewConfigOptions: ViewConfigType['query'],
    userViewData?: {
      displayOptions: DisplayOptionsType | null;
      filters: FilterType[];
    } | null
  ): ViewConfigType['query'] => {
    return keys.reduce((acc, key) => {
      const userValue = userViewData?.displayOptions?.[key];
      if (!userValue) return acc;

      if (key === 'grouping' || key === 'sorting') {
        const value = userValue as any as
          | DisplayOptionsType['grouping']
          | DisplayOptionsType['sorting'];

        const field = value?.field.name.toString();
        const direction = value && 'order' in value ? value.order : null;

        return {
          ...acc,
          [key]: direction
            ? {
                field,
                direction: direction ?? 'asc',
              }
            : {
                field,
              },
        };
      }

      return {
        ...acc,
        [key]: userValue,
      };
    }, viewConfigOptions);
  };

  const createUiDisplayOptionsConfig = (
    config: ViewConfigType['query']
  ): DisplayOptionsUiType => {
    return {
      sorting: {
        isOpen: false,
        rect: null,
        field: viewConfigManager.getSortingField(
          config?.sorting?.field.toString()
        ),
        order: config?.sorting?.direction || 'asc',
      },
      grouping: {
        isOpen: false,
        rect: null,
        field: viewConfigManager.getSortingField(
          config?.grouping?.field.toString() ?? ''
        ),
      },
      isOpen: false,
      showEmptyGroups: config?.showEmptyGroups ?? false,
      showDeleted: config?.showDeleted ?? false,
      softDeleteEnabled: false,
      viewField: {
        allFields: [],
        visible: (config?.selectedViewFields as string[]) ?? null,
      },
      viewType: config?.viewType?.type ? config.viewType : { type: 'list' },
    } satisfies DisplayOptionsUiType;
  };

  const mergeAndCreate = (userViewData?: UserViewData) => {
    const displayOptionsUser = userViewData?.displayOptions
      ? parseDisplayOptionsStringForServer(
          userViewData.displayOptions,
          viewConfigManager
        )
      : null;

    const userFilters = parseFilterStringForServer(
      userViewData?.filters ?? '',
      viewConfigManager
    );

    const merged = mergeViewConfigWithUserViewData(viewConfig.query, {
      displayOptions: displayOptionsUser,
      filters: userFilters,
    });

    const uiDisplayOptions = createUiDisplayOptionsConfig(merged);
    return {
      displayOptions: uiDisplayOptions,
      filters: userFilters,
    };
  };

  return {
    mergeViewConfigWithUserViewData,
    createUiDisplayOptionsConfig,
    mergeAndCreate,
  };
};
