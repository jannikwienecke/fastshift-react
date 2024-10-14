import { FieldConfig, getViewByName } from '@apps-next/core';
import { Icon } from '@apps-next/ui';
import { store$ } from '../legend-store';

export const ComboboxNoneValue = ({ field }: { field: FieldConfig | null }) => {
  if (!field) return null;

  const view = getViewByName(store$.views.get(), field?.name);

  return (
    <div className="flex gap-2 items-center w-full">
      <Icon icon={view.icon} />
      <div className="text-sm">No {view.tableName}</div>
    </div>
  );
};
