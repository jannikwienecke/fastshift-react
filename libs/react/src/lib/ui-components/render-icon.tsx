import { getViewConfigAtom } from '@apps-next/core';
import { useAtomValue } from 'jotai';
import * as icons from 'react-icons/fa';

export function Icon(props: { icon?: keyof typeof icons | null }) {
  const viewConfig = useAtomValue(getViewConfigAtom);

  const Icon = icons?.[props.icon || viewConfig.viewConfig.icon];

  if (!Icon || props.icon === null) return null;
  return (
    <Icon
      style={{ color: viewConfig.viewConfig.iconColor }}
      className="w-3 h-3"
    />
  );
}
