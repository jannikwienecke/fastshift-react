import { ModelSchema } from '../types';
import { schemaHelper } from './schema-helper';

export const generateIncludeFields = (modelSchema: ModelSchema) => {
  const includeDict = modelSchema.models.reduce((acc, model) => {
    const includeFieldsModel = model?.fields
      .map((fieldData) => {
        const { isIdField, relation, isManyToManyRelation, isList } =
          schemaHelper(fieldData, model, modelSchema);

        if (isIdField || !relation || isManyToManyRelation || isList)
          return null;

        return relation.tableName;
      })
      .filter((f) => f !== null);

    return {
      ...acc,
      [model.name.toLowerCase()]: includeFieldsModel,
    };
  }, {} as Record<string, string[]>);

  return includeDict;
};
