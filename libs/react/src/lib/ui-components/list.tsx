import { useViewConfig } from '../use-view-config';

export function List() {
  const { viewConfig } = useViewConfig();

  return (
    <div>
      Result: <span>{viewConfig.getDisplayFieldLabel()}</span>
    </div>
  );
}
