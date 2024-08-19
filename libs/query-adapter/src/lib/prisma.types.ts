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
  default?: unknown;
  isGenerated?: boolean | undefined;
  isUpdatedAt?: boolean;
  relationName?: string;
  relationFromFields?: string[];
  relationToFields?: string[];
};

export type Prisma = {
  dmmf: {
    datamodel: {
      models: Array<{
        fields: Array<PrismaField>;
        name: string;
      }>;
    };
  };
};
