import { Categories, projectsConfig } from '@apps-next/convex';
import { DataType } from '@apps-next/core';
import {
  ClientViewProviderConvex,
  getViewFieldsConfig,
  getViews,
  makeHooks,
  QueryInput,
  useCombobox,
  useHandleSelectCombobox,
  useStoreValue,
} from '@apps-next/react';
import { ComboboxPopover, List } from '@apps-next/ui';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { config } from '../global-config';

type ProjectViewDataType = DataType<'projects', { categories: Categories }>;

const ProjectPage = () => {
  const { useList } = makeHooks<ProjectViewDataType>();
  const getListProps = useList();

  const { handleClose, handleSelect } = useHandleSelectCombobox();

  // TODO: we should not save it on list -> but have like selected: {type: "list or whatever"}
  const { list } = useStoreValue();

  const getComboboxProps = useCombobox({
    state: list?.focusedRelationField ? list.focusedRelationField : null,
    onSelect: handleSelect,
    onClose: handleClose,
  });

  return (
    <div className="p-2 flex gap-2 grow overflow-scroll">
      <ComboboxPopover {...getComboboxProps()} />

      <div className="flex flex-col w-full ">
        <QueryInput />

        <List.Default
          {...getListProps({
            fieldsRight: ['categories'],
            fieldsLeft: [],
          })}
        />
      </div>
      <hr />

      <Outlet />
    </div>
  );
};

export const Route = createFileRoute('/fastApp/projects')({
  component: () => {
    return (
      <ClientViewProviderConvex
        viewConfig={projectsConfig}
        globalConfig={config.config}
        views={getViews()}
        viewFieldsConfig={getViewFieldsConfig()}
      >
        <ProjectPage />
      </ClientViewProviderConvex>
    );
  },
});
