import { BaseViewConfigManager } from '../base-view-config';
import { RecordType, FieldConfig } from '../types';

export type IncludeDict = {
  [key in string]: boolean | IncludeDict;
};

export const parseResult = ({
  include,
  viewConfigManager,
}: {
  include: IncludeDict;
  viewConfigManager: BaseViewConfigManager;
}) => {
  const getManyToManyField = (key: string) => {
    return viewConfigManager
      .getViewFieldList()
      .find((f) => f.relation?.manyToManyRelation === key);
  };

  const parseResult = (result: RecordType[]) => {
    return result.map((r) => {
      return Object.keys(r).reduce((acc, key) => {
        if (include[key]) {
          const items = r[key] as RecordType[];

          let field: FieldConfig | undefined;
          try {
            field =
              getManyToManyField(key) ?? viewConfigManager.getFieldBy(key);
          } catch (error) {
            //
          }

          //   example:
          // Task -> Many To Many Relationship with Model "Tag"
          // so we have a join table called for example TaskTag
          // we get data back like {
          //   Task: {
          //     id: 1,
          //     name: 'Task 1',
          //     tags: [
          //       {
          //         id: 1
          //         tag: {
          //           id: 1,
          //           name: 'Tag 1',
          //         },
          //       },
          //     ],
          //   },
          //   we need to extract the tag data from the join table
          //   and add it to the task data
          //   relation.tableName === tag
          // manyToManyFIeld === tags
          if (
            field?.relation?.manyToManyRelation &&
            field.relation.type === 'manyToMany'
          ) {
            const relation = field.relation;

            return {
              ...acc,

              [relation.tableName]: items.map(
                (item) => item[relation.tableName]
              ),
            };
          }
        }

        return {
          ...acc,
          [key]: r[key],
        };
      }, {});
    });
  };

  return {
    parseResult,
  };
};
