import { useTranslation } from '@apps-next/core';
import { Input } from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import { store$ } from '../legend-store';

export const QueryInput = observer(() => {
  const { t } = useTranslation();
  return (
    <div className="w-full pb-6 flex justify-end">
      <Input
        className="w-[20rem] mx-2"
        placeholder={t('search.placeholder')}
        value={store$.globalQuery.get()}
        onChange={(e) => store$.globalQueryUpdate(e.target.value)}
      />
      <button
        className="border border-red-500 p-1 px-4 rounded-md"
        onClick={store$.globalQueryReset}
      >
        Reset
      </button>
    </div>
  );
});
