'use client';
import { viewConfig } from './tasks.config';

import {
  BaseViewConfigManager,
  useStoreDispatch,
  useStoreValue,
} from '@apps-next/core';
import {
  ComboboxFieldValue,
  makeHooks,
  QueryInput,
  useCombobox,
  useHandleSelectCombobox,
  ViewProvider,
} from '@apps-next/react';
import { ComboboxPopover, List } from '@apps-next/ui';
import { TaskViewDataType } from './tasks.types';

export const dynamic = 'force-dynamic';

export default function FastAppTasksPage() {
  return (
    <ViewProvider
      view={{
        viewConfigManager: new BaseViewConfigManager(viewConfig),
      }}
    >
      <TaskContent />
    </ViewProvider>
  );
}

const TaskContent = () => {
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
