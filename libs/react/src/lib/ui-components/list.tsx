import { useViewConfig } from '../use-view-config';

export function List() {
  const { viewConfigManager } = useViewConfig();

  return (
    <div>
      Result: <span>{viewConfigManager.getDisplayFieldLabel()}</span>
    </div>
  );
}
