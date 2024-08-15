type ListItem = {
  name: string;
  description?: string;
};

export type ListProps<TItems extends Record<string, any>> = {
  items: (TItems & ListItem)[];
};

export function List<T extends Record<string, any>>(props: ListProps<T>) {
  return (
    <div className="flex flex-col gap-4 p-4 w-full">
      {props.items.map((item) => (
        <div key={item.name} className="flex flex-col">
          <div className="text-lg font-bold">{item.name}</div>

          {item.description ? <div>{item.description}</div> : null}
        </div>
      ))}
    </div>
  );
}
