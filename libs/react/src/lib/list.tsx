import { add } from '@apps-next/core';
import { useViewConfig } from './useViewConfig';

export function List() {
  const { viewConfig } = useViewConfig();

  return (
    <div>
      Result: <span>{add(1, 2)}</span>
    </div>
  );
}
