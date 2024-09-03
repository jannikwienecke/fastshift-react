'use client';

import {
  setClientViewConfig,
  useStoreDispatch,
  useStoreValue,
  ViewConfigType,
} from '@apps-next/core';
import {
  ComboboxFieldValue,
  DataType,
  makeHooks,
  useCombobox,
  useHandleSelectCombobox,
} from '@apps-next/react';
import { ComboboxPopover, Form, List } from '@apps-next/ui';
import { Category, Owner, Task } from '@prisma/client';
import { AvatarIcon } from '@radix-ui/react-icons';
import {
  IconAdjustmentsHorizontal,
  IconListSearch,
  IconSubtask,
} from '@tabler/icons-react';

// use Default list but adjut each item [x]
// use default list but have border bottom
// dont use default list -> provide custom list
// use default list -> render yourself and adjust sorting
// use default list -> pass props to list

type ProjectViewDataType = DataType<
  'project',
  { owner: Owner; category: Category; tasks: Task[] }
>;

setClientViewConfig<ProjectViewDataType>('project', {
  fields: {
    category: {
      component: {
        list: ({ data }) => {
          return <>{data.getValue('category').label}</>;
        },
      },
    },
    tasks: {
      component: {
        list: ({ data }) => {
          const tasks = data.getValue('tasks').length;
          return (
            <div className="flex flex-row items-center gap-1 px-3 border border-gray-200 rounded-md">
              {tasks}
              <IconSubtask className="w-4 h-4" />
            </div>
          );
        },
      },
    },
    owner: {
      component: {
        list: ({ data }) => {
          const { firstname, lastname } = data.getValue('owner').raw;
          return (
            <div className="flex space-x-1 items-center pr-2">
              <div>
                {`${firstname.slice(0, 1).toUpperCase()}`}
                {`${lastname.slice(0, 1).toUpperCase()}`}
              </div>
              <AvatarIcon className="w-5 h-5" />
            </div>
          );
        },
      },
    },
  },
});

export const ProjectsClient = ({
  viewConfig,
}: {
  viewConfig: ViewConfigType<'project'>;
}) => {
  const { useList, useQuery, useForm } = makeHooks<ProjectViewDataType>();

  const { handleClose, handleSelect } = useHandleSelectCombobox();

  const getListProps = useList();

  const { list } = useStoreValue();

  const table = list?.focusedRelationField?.field?.relation?.tableName;

  const getComboboxProps = useCombobox({
    state: list?.focusedRelationField ? list.focusedRelationField : null,
    onSelect: handleSelect,
    onClose: handleClose,
    renderValue: (value) => {
      if (!list?.focusedRelationField?.field || !table) return null;
      return <ComboboxFieldValue tableName={table} value={value} />;
    },
  });

  const { edit } = useStoreValue();

  const { data } = useQuery();

  // @ts-expect-error INVALID FIELD
  const INVALID = data?.[0]?.NOT_VALID_FIELD;

  const getFormProps = useForm();

  const dispatch = useStoreDispatch();

  return (
    <>
      <ComboboxPopover {...getComboboxProps()} />

      <div className="flex grow mx-2 flex-col gap-2 h-[calc(100vh-1rem)] border-[1px] border-gray-100">
        <div className="">
          {edit.isEditing ? <Form {...getFormProps()} /> : null}

          <div className="flex flex-row border-b border-gray-200 pl-8 pr-4 items-center py-1 justify-between">
            <div className="flex flex-row space-y-1 items-center space-x-2 hover:bg-gray-100 rounded-md p-1 px-2">
              <IconListSearch className="w-4 h-4" />
              <div className="text-xs">Filter</div>
            </div>

            <div className="flex flex-row space-y-1 items-center space-x-2 border border-gray-100 hover:bg-gray-100 rounded-md p-1 px-2">
              <IconAdjustmentsHorizontal className="w-4 h-4" />
              <div className="text-xs">Sort</div>
            </div>
          </div>

          <List {...getListProps()}>
            {getListProps({
              fieldsLeft: ['label'],
              fieldsRight: ['owner', 'category', 'tasks'],
            }).items.map((item) => {
              return (
                <List.Item key={item.id} item={item}>
                  <List.Control />

                  <List.Icon icon={item.icon} />

                  <List.Values>
                    <div className="flex flex-row gap-2">
                      {item.valuesLeft.map((value) => (
                        <List.Value key={value.id}>{value.render()}</List.Value>
                      ))}
                    </div>

                    <List.ValuesRight values={item.valuesRight} />
                  </List.Values>
                </List.Item>
              );
            })}
          </List>
        </div>
      </div>
    </>
  );
};
