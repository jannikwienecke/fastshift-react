import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithDebounce } from '../jotai-utils';

export const queryAtom = atom('');

export const {
  isDebouncingAtom,
  debouncedValueAtom: debouncedQueryAtom,
  clearTimeoutAtom,
  currentValueAtom,
} = atomWithDebounce('');

export const QueryInput = () => {
  const setReset = useSetAtom(debouncedQueryAtom);
  const setDebouncedValue = useSetAtom(debouncedQueryAtom);
  const currentValue = useAtomValue(currentValueAtom);

  return (
    <div className="w-full pb-6 flex justify-end">
      <input
        className="border border-background p-1 px-4 rounded-md w-[20rem]"
        placeholder="Search"
        value={currentValue ?? ''}
        onChange={(e) => setDebouncedValue(e.target.value)}
      />
      <button
        className="border border-red-500 p-1 px-4 rounded-md"
        onClick={() => setReset('')}
      >
        Reset
      </button>
    </div>
  );
};
