import { ID } from '@apps-next/core';

export type PrismaField = {
  name: string;
  kind: string;
  isList: boolean;
  isRequired: boolean;
  isUnique: boolean;
  isId: boolean;
  isReadOnly: boolean;
  hasDefaultValue: boolean;
  type: string;
  default?: { name?: string; args: unknown[] } | unknown;
  isGenerated?: boolean | undefined;
  isUpdatedAt?: boolean;
  relationName?: string;
  relationFromFields?: string[];
  relationToFields?: string[];
};

export type PrismaEnum = {
  name: string;
  values: Array<{ name: string; dbName: string | null }>;
  dbName: string | null;
};

export type Prisma = {
  dmmf: {
    datamodel: {
      models: Array<{
        fields: Array<PrismaField>;
        name: string;
      }>;
      enums: Array<PrismaEnum>;
      types: unknown;
    };
  };
};

export type PrismaRecord = Record<string, any> & { id?: number | string };

export type PrismaWhere = {
  OR?: Array<{
    [key in string]: {
      contains?: string;
      mode?: 'insensitive' | 'sensitive';
    };
  }>;
};

export type PrismaOrderBy = {
  id?: 'asc' | 'desc';
} & Record<string, 'asc' | 'desc'>;

export type PrismaInclude = {
  [key in string]: boolean | PrismaInclude;
};

export type PrismaFindManyArgs = {
  take?: number;
  where?: PrismaWhere;
  orderBy?: PrismaOrderBy;
  include?: PrismaInclude;
};

export type PrismaClient = {
  [key in string]: {
    findMany: (args: PrismaFindManyArgs) => Promise<PrismaRecord[]>;
    create: (args: { data: PrismaRecord }) => Promise<PrismaRecord>;
    delete: (args: { where: { id: ID } }) => Promise<void>;
    update: (args: { where: { id: ID }; data: PrismaRecord }) => Promise<void>;
  };
};

export type DbMutation = PrismaClient[string];
