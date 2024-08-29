'use client';

import {
  setClientViewConfig,
  useStoreDispatch,
  useStoreValue,
} from '@apps-next/core';
import {
  makeHooks,
  QueryInput,
  useCombobox,
  useHandleSelectCombobox,
} from '@apps-next/react';
import { ComboboxPopover, Form, List } from '@apps-next/ui';
import {
  CompletedComponent,
  PriorityComponent,
  ProjectComponent,
  ProjectComponentCombobox,
  TagsCombobox,
  TagsComponent,
} from './tasks.components';
import { TaskViewDataType } from './tasks.types';

setClientViewConfig<TaskViewDataType>('task', {
  fields: {
    completed: {
      component: {
        list: CompletedComponent,
        combobox: CompletedComponent,
      },
    },

    priority: {
      component: {
        list: PriorityComponent,
        combobox: PriorityComponent,
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

export const TasksClient = () => {
  const { useList, useQuery, useForm, useQueryData } =
    makeHooks<TaskViewDataType>();

  const { handleSelect, handleClose } = useHandleSelectCombobox();

  const getListProps = useList();

  const { edit } = useStoreValue();

  const { data } = useQuery();

  // @ts-expect-error INVALID FIELD
  const INVALID = data?.[0]?.NOT_VALID_FIELD;

  // console.log(data?.[0].tags?.[0].tag.name);
  const getFormProps = useForm();

  const dispatch = useStoreDispatch();

  const queryData = useQueryData();

  const getComboboxProps = useCombobox({
    onSelect: handleSelect,
    onClose: handleClose,
  });

  return (
    <div className="p-4 pb-0 flex flex-col w-full overflow-scroll h-[calc(100vh-16px)]">
      <div className="pt-1 border-b border-gray-100">
        <div>
          <QueryInput />
        </div>
        {edit.isEditing ? <Form {...getFormProps()} /> : null}
      </div>

      <ComboboxPopover {...getComboboxProps()} />

      <List.Default
        {...getListProps({
          fieldsLeft: ['name', 'priority'],
          fieldsRight: ['project', 'tag'],
        })}
      />
    </div>
  );
};
