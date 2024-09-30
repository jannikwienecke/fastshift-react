import { store$ } from '../legend-store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Icon(props: { icon?: React.FC<any> }) {
  const iconColor = store$.viewConfigManager.viewConfig.iconColor.get();

  const Icon = props.icon || store$.viewConfigManager.viewConfig.get().icon;

  return <Icon style={{ color: iconColor }} className="w-3 h-3" />;
}
