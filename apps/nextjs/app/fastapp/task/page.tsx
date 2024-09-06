'use client';
import { viewConfig } from './tasks.config';

import { BaseViewConfigManager } from '@apps-next/core';
import {
  makeHooks,
  QueryInput,
  useCombobox,
  useHandleSelectCombobox,
  useStoreDispatch,
  useStoreValue,
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
  const { useList, useQuery, useQueryData, xx } = makeHooks<TaskViewDataType>();

  const { handleSelect, handleClose } = useHandleSelectCombobox();

  const getListProps = useList();

  const { edit } = useStoreValue();

  const { data } = useQuery();

  const { dataModel } = useQueryData();

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
