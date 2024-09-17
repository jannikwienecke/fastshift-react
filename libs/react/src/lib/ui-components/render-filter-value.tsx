import { ComboxboxItem } from '@apps-next/core';
import { getViewByName, useView } from '../use-view';
import { CodeIcon } from '@radix-ui/react-icons';

export const FilterValue = (props: { value: ComboxboxItem }) => {
  const { viewConfigManager, registeredViews } = useView();

  const field = viewConfigManager.getFieldBy(props.value.id.toString());

  const view = field.relation
    ? getViewByName(registeredViews, field.name)
    : undefined;

  return (
    <div className="flex flex-row gap-2 items-center">
      <span>{view?.icon && <view.icon className="w-4 h-4" />}</span>

      <span>{field.name.firstUpper()}</span>
    </div>
  );
};
