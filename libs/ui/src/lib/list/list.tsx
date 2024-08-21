export type ListItem = {
  id: string;
  name: string;
  description?: string;
};

export type ListProps<TItem extends ListItem> = {
  items: TItem[];
  onDelete?: (item: TItem) => void;
  onEdit?: (item: TItem) => void;
};

export function List<T extends ListItem>(props: ListProps<T>) {
  return (
    <div
      // animateInitial={true}
      className="flex flex-col gap-4 p-4 w-full"
    >
      {props.items.map((item) => (
        <li key={item.name} className="flex flex-row justify-between">
          <div className="flex flex-col">
            <div className="text-base font-bold">{item.name}</div>

            {item.description ? (
              <div className="text-sm">{item.description}</div>
            ) : null}
          </div>

          <div className="flex flex-row gap-2">
            <button
              onClick={() => props.onEdit?.(item)}
              className="btn bg-orange-400"
            >
              Edit
            </button>

            <button
              onClick={() => props.onDelete?.(item)}
              className="btn btn-primary bg-red-500"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </div>
  );
}
