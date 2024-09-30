import { store$ } from '../legend-store';
import { observer } from '@legendapp/state/react';
import { Input } from '@apps-next/ui';

export const QueryInput = observer(() => {
  return (
    <div className="w-full pb-6 flex justify-end">
      <Input
        className="w-[20rem] mx-2"
        placeholder="Search"
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
