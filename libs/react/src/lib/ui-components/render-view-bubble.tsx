import { GetTableName } from '@apps-next/core';
import { useViewOf } from '../use-view';
import { Bubble } from '@apps-next/ui';
import { Icon } from './render-icon';

export const ViewBubble = (props: {
  tableName: GetTableName;
  value: string;
  color?: string;
}) => {
  const view = useViewOf(props.tableName);
  return (
    <Bubble
      label={props.value}
      icon={<Icon icon={view.icon || null} />}
      color={props.color}
    />
  );
};
