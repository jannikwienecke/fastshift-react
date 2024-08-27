'use client';

import {
  setClientViewConfig,
  useStoreDispatch,
  useStoreValue,
  ViewConfigType,
} from '@apps-next/core';
import { DataType, makeHooks } from '@apps-next/react';
import { Form, List } from '@apps-next/ui';
import { Owner } from '@prisma/client';
import { AvatarIcon } from '@radix-ui/react-icons';
import { IconAdjustmentsHorizontal, IconListSearch } from '@tabler/icons-react';

// use Default list but adjut each item [x]
// use default list but have border bottom
// dont use default list -> provide custom list
// use default list -> render yourself and adjust sorting
// use default list -> pass props to list

type ProjectViewDataType = DataType<'project', { owner: Owner }>;

setClientViewConfig<ProjectViewDataType>('project', {
  fields: {
    owner: {
      component: ({ data }: any) => {
        const owner = data;
        return (
          <>
            <AvatarIcon className="w-5 h-5" />
          </>
        );
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

  const getListProps = useList();
  const { edit } = useStoreValue();

  const { data } = useQuery();

  // @ts-expect-error INVALID FIELD
  const INVALID = data?.[0]?.NOT_VALID_FIELD;

  const getFormProps = useForm();

  const dispatch = useStoreDispatch();

  return (
    <div className="flex grow mx-2 flex-col gap-2 h-[calc(100vh-1rem)] border-[1px] border-gray-200">
      <div className="">
        {edit.isEditing ? <Form {...getFormProps()} /> : null}

        <div className="flex flex-row border-b border-gray-200 pl-8 pr-4 items-center py-1 justify-between">
          <div className="flex flex-row space-y-1 items-center space-x-2 hover:bg-gray-100 rounded-md p-1 px-2">
            <IconListSearch className="w-4 h-4" />
            <div className="text-xs">Filter</div>
          </div>

          <div className="flex flex-row space-y-1 items-center space-x-2 border border-gray-200 hover:bg-gray-100 rounded-md p-1 px-2">
            <IconAdjustmentsHorizontal className="w-4 h-4" />
            <div className="text-xs">Sort</div>
          </div>
        </div>

        <List>
          {getListProps({
            fieldsLeft: ['label'],
            fieldsRight: ['owner'],
          }).items.map((item) => {
            return (
              <List.Item key={item.id}>
                <List.Control />

                <List.Icon icon={item.icon} />

                <List.Values>
                  <div className="flex flex-row gap-2">
                    {item.valuesLeft.map((value) => (
                      <List.Value key={value.id}>{value.render()}</List.Value>
                    ))}
                  </div>

                  <div>
                    {item.valuesRight.map((value) => (
                      <List.Value key={value.id}>{value.render()}</List.Value>
                    ))}
                  </div>
                </List.Values>
              </List.Item>
            );
          })}
        </List>
      </div>
    </div>
  );
};
