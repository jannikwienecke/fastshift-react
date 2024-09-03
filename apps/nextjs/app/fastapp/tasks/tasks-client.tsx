'use client';

import {
  setClientViewConfig,
  useStoreDispatch,
  useStoreValue,
} from '@apps-next/core';
import {
  ComboboxFieldValue,
  makeHooks,
  QueryInput,
  useCombobox,
  useHandleSelectCombobox,
} from '@apps-next/react';
import { ComboboxPopover, Form, List } from '@apps-next/ui';
import {
  CompletedComponent,
  PriorityComponent,
  PriorityComponentCombobox,
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

export const TasksClient = () => {
  const { useList, useQuery, useForm, useQueryData } =
    makeHooks<TaskViewDataType>();

  const { handleSelect, handleClose } = useHandleSelectCombobox();

  const getListProps = useList();

  const { edit } = useStoreValue();

  const { data } = useQuery();
  const { dataModel } = useQueryData();

  // @ts-expect-error INVALID FIELD
  const INVALID = data?.[0]?.NOT_VALID_FIELD;

  const getFormProps = useForm();

  const dispatch = useStoreDispatch();

  const { list } = useStoreValue();

  const table = list?.focusedRelationField?.field?.relation?.tableName;

  const getComboboxProps = useCombobox({
    state: list?.focusedRelationField ? list.focusedRelationField : null,
    onSelect: handleSelect,
    onClose: handleClose,
    renderValue: (value) => {
      return (
        <ComboboxFieldValue
          tableName={table ?? list?.focusedRelationField?.field?.name ?? ''}
          value={value}
        />
      );
    },
  });

  const props = getComboboxProps();

  return (
    <div className="p-4 pb-0 flex flex-col w-full overflow-scroll h-[calc(100vh-16px)]">
      <div className="pt-1 border-b border-gray-100">
        <div>
          <QueryInput />
        </div>
        {edit.isEditing ? <Form {...getFormProps()} /> : null}
      </div>

      <ComboboxPopover {...props} />

      <List.Default
        {...getListProps({
          fieldsLeft: ['name'],
          fieldsRight: ['project', 'tag', 'priority', 'completed'],
        })}
      />
    </div>
  );
};
