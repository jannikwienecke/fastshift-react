import {
  FieldConfig,
  getViewByName,
  renderModelName,
  useTranslation,
} from '@apps-next/core';
import { CircleDashedIcon } from 'lucide-react';
import { store$ } from '../legend-store';

export const ComboboxNoneValue = ({ field }: { field: FieldConfig | null }) => {
  const { t } = useTranslation();
  if (!field) return null;

  const view = getViewByName(store$.views.get(), field?.name);

  return (
    <div className="flex gap-2 items-center w-full">
      {/* <Icon icon={view.icon} /> */}
      <CircleDashedIcon className="text-foreground/60 h-4 w-4" />

      <div className="text-sm">
        {t('common.none')} {renderModelName(view?.tableName, t)}
      </div>
    </div>
  );
};
