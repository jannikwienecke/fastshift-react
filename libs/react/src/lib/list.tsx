import { add } from '@apps-next/core';
import { useViewConfig } from './use-view-config';

export function List() {
  const { viewConfig } = useViewConfig();

  return (
    <div>
      Result: <span>{add(1, 2)}</span>
    </div>
  );
}
