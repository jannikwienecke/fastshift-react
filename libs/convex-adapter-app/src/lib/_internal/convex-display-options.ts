import { QueryServerProps } from '@apps-next/core';

export const getDisplayOptionsInfo = (props: QueryServerProps) => {
  const { viewConfigManager, displayOptions } = props;
  const _indexFields = viewConfigManager.getIndexFields();

  const hasSortingField = !!displayOptions?.sorting?.field.name;

  // TODO HIER WEITER MACHEN
  // add grouping to the list view
  const indexFields_ = _indexFields
    .filter((f) => f.fields.length === 1)
    .map((f) => ({
      name: f.name,
      field: f.fields[0],
    }));

  const displaySortingIndexField = indexFields_.find(
    (f) => f.field === displayOptions?.sorting?.field.name
  );

  return {
    sorting: displayOptions?.sorting,
    hasSortingField,
    displaySortingIndexField,
  };
};
