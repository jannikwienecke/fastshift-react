import { t } from 'i18next';

export type PriorityVariant = 'none' | 'urgent' | 'high' | 'medium' | 'low';

export type PriorityProps = {
  priority: PriorityVariant;
  showLabel?: boolean;
};

const PRIORITY_LABEL = {
  none: 'priority.none',
  low: 'priority.low',
  medium: 'priority.medium',
  high: 'priority.high',
  urgent: 'priority.urgent',
} satisfies { [key: string]: string };

const PriorityIcon = (props: { level: 'high' | 'medium' | 'low' }) => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <rect x="1" y="10" width="3" height="5" fill="black" />
    <rect
      x="6"
      y="6"
      width="3"
      height="9"
      fill={
        props.level === 'high' || props.level === 'medium'
          ? 'black'
          : 'lightgray'
      }
    />
    <rect
      x="11"
      y="2"
      width="3"
      height="13"
      fill={props.level === 'high' ? 'black' : 'lightgray'}
    />
  </svg>
);

export const PriorityComponent = (props: PriorityProps) => {
  const { priority } = props;
  const showLabel = props.showLabel ?? false;

  const label = PRIORITY_LABEL[priority as keyof typeof PRIORITY_LABEL];

  return (
    <div className="flex items-center gap-3">
      {priority === 'urgent' ? (
        <div className="bg-foreground/80 w-4 text-background grid place-items-center text-xs rounded-sm hover:bg-foreground">
          !
        </div>
      ) : priority === 'none' ? (
        <span className="text-xs bg-background/80 hover:bg-background">
          ---
        </span>
      ) : (
        <PriorityIcon level={priority as 'high' | 'medium' | 'low'} />
      )}

      {showLabel && <span>{t(label)}</span>}
    </div>
  );
};
