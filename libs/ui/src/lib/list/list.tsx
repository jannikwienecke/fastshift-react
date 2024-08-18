import { AnimatedList } from '../animated-list';

type ListItem = {
  name: string;
  description?: string;
};

export type ListProps<TItems> = {
  items: (TItems & ListItem)[];
};

export function List<T extends Record<string, any>>(props: ListProps<T>) {
  return (
    <AnimatedList
      animateInitial={true}
      className="flex flex-col gap-4 p-4 w-full"
    >
      {props.items.map((item) => (
        <li key={item.name} className="flex flex-col">
          <div className="text-base font-bold">{item.name}</div>

          {item.description ? (
            <div className="text-sm">{item.description}</div>
          ) : null}
        </li>
      ))}
    </AnimatedList>
  );
}
