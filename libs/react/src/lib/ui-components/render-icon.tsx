import { useAtomValue } from 'jotai';
import { getViewConfigAtom } from '../stores';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Icon(props: { icon?: React.FC<any> }) {
  const viewConfig = useAtomValue(getViewConfigAtom);

  const Icon = props.icon || viewConfig.viewConfig.icon;

  return (
    <Icon
      style={{ color: viewConfig.viewConfig.iconColor }}
      className="w-3 h-3"
    />
  );
}
