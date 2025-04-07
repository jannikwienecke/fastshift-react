import { store$ } from '../legend-store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Icon(props: { icon?: React.FC<any>; color?: string }) {
  const iconColor = store$.viewConfigManager.viewConfig.iconColor.get();

  const Icon = props.icon || store$.viewConfigManager.viewConfig.get()?.icon;

  if (!Icon) return null;
  return (
    <Icon
      style={{
        color: props.color || iconColor,
        height: '0,75rem!important',
        width: '0,75rem!important',
      }}
      className="w-3 h-3"
    />
  );
}
