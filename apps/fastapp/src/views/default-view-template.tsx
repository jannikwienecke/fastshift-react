import {
  RecordType,
  MakeListPropsOptions,
  MakeFilterPropsOptions,
  MakeDisplayOptionsPropsOptions,
} from '@apps-next/core';
import { MakeComboboxPropsOptions } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { Outlet } from '@tanstack/react-router';
import {
  RenderComboboxPopover,
  RenderContextmenu,
  RenderDisplayOptions,
  RenderFilter,
  RenderInputDialog,
  RenderList,
} from './default-components';

export const DefaultViewTemplate = observer(
  <T extends RecordType>(props: {
    listOptions?: MakeListPropsOptions<T>;
    comboboOptions?: MakeComboboxPropsOptions<T>;
    filterOptions?: MakeFilterPropsOptions<T>;
    displayOptions: MakeDisplayOptionsPropsOptions<T>;
    RenderInputDialog?: React.FC;
  }) => {
    return (
      <div className="p-2 flex flex-col gap-2 grow overflow-scroll">
        <div className="flex flex-col w-full ">
          <RenderFilter options={props.filterOptions} />
        </div>

        <RenderComboboxPopover options={props.comboboOptions} />

        {props.RenderInputDialog ? (
          <props.RenderInputDialog />
        ) : (
          <RenderInputDialog />
        )}

        <RenderContextmenu />

        <div className="flex flex-col w-full ">
          <div className="flex flex-row gap-2 justify-end">
            <RenderDisplayOptions options={props.displayOptions} />
          </div>

          <RenderList options={props.listOptions} />
        </div>
        <hr />

        <Outlet />
      </div>
    );
  }
);
