import { add } from '@apps-next/core';

export function List() {
  return (
    <div>
      Result: <span>{add(1, 2)}</span>
    </div>
  );
}
