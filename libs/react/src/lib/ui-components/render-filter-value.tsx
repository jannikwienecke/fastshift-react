import { ComboxboxItem, getViewByName, ViewConfigType } from '@apps-next/core';
import { useView } from '../use-view';

export const FilterValue = (props: { value: ComboxboxItem }) => {
  const { viewConfigManager, registeredViews } = useView();

  let name = '';
  let view: ViewConfigType | undefined;
  let Icon: React.FC<any> | undefined;

  try {
    const field = viewConfigManager.getFieldBy(props.value.id.toString());
    view = field.relation
      ? getViewByName(registeredViews, field.name)
      : undefined;
    name = field.name.firstUpper();
    Icon = view?.icon;
  } catch (error) {
    name = props.value.label;
    Icon = props.value.icon;
  }

  return (
    <div className="flex flex-row gap-2 items-center">
      <span>{Icon && <Icon className="w-4 h-4" />}</span>

      <span>{name}</span>
    </div>
  );
};
