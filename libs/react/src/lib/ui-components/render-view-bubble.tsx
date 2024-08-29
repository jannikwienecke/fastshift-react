import { GetTableName } from '@apps-next/core';
import { useViewOf } from '../use-view';
import { Bubble } from '@apps-next/ui';
import { Icon } from './render-icon';

export const ViewBubble = (props: {
  tableName: GetTableName;
  value: string;
  color?: string;
  showIcon?: boolean;
}) => {
  const view = useViewOf(props.tableName as string);
  return (
    <Bubble
      label={props.value}
      icon={props.showIcon === false ? null : <Icon icon={view.icon || null} />}
      color={props.color}
    />
  );
};
