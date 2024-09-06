import { PrismaRecord } from '../prisma.types';

export const relationalQueryHelper = ({
  displayField,
  result,
}: {
  displayField: string;
  result: PrismaRecord[];
}) => {
  const makeRelationalQueryData = () => {
    return {
      data: result.map((data) => ({
        id: data.id,
        name: data[displayField],
      })),
    };
  };

  return {
    relationQueryData: makeRelationalQueryData(),
  };
};
