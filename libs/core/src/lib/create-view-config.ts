import { BaseViewConfigManager } from './base-view-config';
import {
  GetTableName,
  RegisteredRouter,
  ViewConfigType,
  ViewFieldConfig,
} from './types';

type PrismaField = {
  name: string;
  kind: string;
  isList: boolean;
  isRequired: boolean;
  isUnique: boolean;
  isId: boolean;
  isReadOnly: boolean;
  hasDefaultValue: boolean;
  type: string;
  default?: unknown;
  isGenerated?: boolean | undefined;
  isUpdatedAt?: boolean;
};

type Prisma = {
  dmmf: {
    datamodel: {
      // PrismaField
      models: Array<{
        fields: Array<PrismaField>;
      }>;
    };
  };
};

export function createViewConfig<T extends GetTableName>(
  tableName: T,
  config: Partial<Omit<ViewConfigType<T>, 'viewFields' | 'tableName'>>
) {
  // TODO USE REAL IMPLEMENTATIONS FOR PRISMA AND CONVEX
  const viewFields = {} as ViewFieldConfig;
  const searchableFields = {} as any;

  // TODO RENAME testType
  const viewConfig: ViewConfigType<T> = {
    ...config,
    displayField: {
      field: config.displayField?.field as any,
      cell: config.displayField?.cell,
    },
    viewFields: viewFields,
    tableName,
    viewName: config.viewName ?? (tableName as string),
    query: {
      searchableFields: searchableFields,
    },
  };

  const viewConfigManager = new BaseViewConfigManager<any>(viewConfig);

  return viewConfigManager;
}
