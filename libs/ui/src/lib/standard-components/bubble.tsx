import { Bubble } from '../bubble';
import { Icon } from '../icon';

type BubbleItemProps = {
  label: string;
  color?: string;
  icon?: React.FC<any> | null;
};

export const BubbleItem = (props: BubbleItemProps) => {
  return (
    <Bubble
      label={props.label}
      icon={props.icon ? <Icon icon={props.icon || null} /> : null}
      color={props.color}
    />
  );
};

export const BubbleList = (props: { items: BubbleItemProps[] }) => {
  if (!props.items) return null;

  const visibleTags = props.items.slice(0, 4);

  return (
    <div className="flex items-center">
      <>
        {visibleTags?.map?.((item, index) => (
          <div key={item.label + index} className={index !== 0 ? '-ml-2' : ''}>
            <BubbleItem
              label={item.label}
              icon={item.icon}
              color={item.color}
            />
          </div>
        ))}

        {visibleTags.length < props.items.length && (
          <div className={'-ml-2'}>
            <BubbleItem
              label={`+${props.items.length - visibleTags.length} more`}
            />
          </div>
        )}
      </>
    </div>
  );
};
