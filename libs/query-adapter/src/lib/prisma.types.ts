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

// return await prisma.post.findMany({
//   where: {
//     OR: [
//       {
//         title: {
//           contains: query,
//           mode: 'insensitive',
//         },
//       },
//       {
//         content: {
//           contains: query,
//           mode: 'insensitive',
//         },
//       },
//     ],
//   },
// });

export type PrismaRecord = Record<string, any> & { id?: number | string };

export type PrismaWhere = {
  OR?: Array<{
    [key in string]: {
      contains?: string;
      mode?: 'insensitive' | 'sensitive';
    };
  }>;
};

export type PrismaClient = {
  [key in string]: {
    findMany: (args: { where?: PrismaWhere }) => Promise<PrismaRecord[]>;
    create: (args: { data: PrismaRecord }) => Promise<PrismaRecord>;
    delete: (args: { where: { id: string } }) => Promise<void>;
  };
};

export type DbMutation = PrismaClient[string];
