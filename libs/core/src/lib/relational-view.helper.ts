import { RegisteredViews } from './types';

export const relationalViewHelper = (
  relationalTableName: string,
  views: RegisteredViews
) => {
  const getRelationalView = (relationalTableName: string) => {
    const relationalView = views[relationalTableName];

    if (!relationalView) {
      throw new Error(
        `relationalViewHelper: view not found for ${relationalTableName}`
      );
    }

    return relationalView;
  };

  return {
    relationalView: getRelationalView(relationalTableName),
  };
};
