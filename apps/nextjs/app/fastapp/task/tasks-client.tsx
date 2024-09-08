'use client';

import {
  makeHooks,
  useHandleSelectCombobox,
  useStoreValue,
  useStoreDispatch,
  useCombobox,
  QueryInput,
} from '@apps-next/react';
import { ComboboxPopover, List } from '@apps-next/ui';
import { TaskViewDataType } from './tasks.types';
import { setClientViewConfig } from '@apps-next/core';
import {
  CompletedComponent,
  PriorityComponent,
  PriorityComponentCombobox,
  TagsComponent,
  TagsCombobox,
  ProjectComponent,
  ProjectComponentCombobox,
} from './tasks.components';

setClientViewConfig<TaskViewDataType>('task', {
  fields: {
    completed: {
      component: {
        list: CompletedComponent,
        // combobox: CompletedComponent,
      },
    },

    priority: {
      component: {
        list: PriorityComponent,
        combobox: PriorityComponentCombobox,
      },
    },

    tag: {
      component: {
        list: TagsComponent,
        combobox: TagsCombobox,
      },
    },
    project: {
      component: {
        list: ProjectComponent,
        combobox: ProjectComponentCombobox,
      },
    },
  },
});

export const TaskClient = () => {
  const { useList, useQuery } = makeHooks<TaskViewDataType>();

  const { handleSelect, handleClose } = useHandleSelectCombobox();

  const getListProps = useList();

  const { data } = useQuery();

  // @ts-expect-error INVALID FIELD
  const INVALID = data?.[0]?.NOT_VALID_FIELD;

  const dispatch = useStoreDispatch();

  const { list } = useStoreValue();

  const getComboboxProps = useCombobox({
    state: list?.focusedRelationField ? list.focusedRelationField : null,
    onSelect: handleSelect,
    onClose: handleClose,
  });

  const comboboxProps = getComboboxProps();

  return (
    <div className="p-4 pb-0 flex flex-col w-full overflow-scroll h-[calc(100vh-16px)]">
      <div className="pt-1 border-b border-gray-100">
        <div>
          <QueryInput />
        </div>
      </div>

      <ComboboxPopover {...comboboxProps} />

      <List.Default
        {...getListProps({
          fieldsLeft: ['name'],
          fieldsRight: ['project', 'tag', 'priority', 'completed'],
        })}
      />
    </div>
  );
};
