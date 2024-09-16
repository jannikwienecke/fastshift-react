import { useFilter } from '../../store.ts';

export const useFilterAdapter = () => {
  const { filter } = useFilter();
};
