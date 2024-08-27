import { getViewConfigAtom } from '@apps-next/core';
import { useAtomValue } from 'jotai';
import * as icons from 'react-icons/fa';

export function Icon() {
  const viewConfig = useAtomValue(getViewConfigAtom);

  const Icon = icons?.[viewConfig.viewConfig.icon];

  if (!Icon) return null;
  return (
    <Icon
      style={{ color: viewConfig.viewConfig.iconColor }}
      className="w-4 h-4"
    />
  );
}
