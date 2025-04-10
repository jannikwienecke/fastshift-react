import {
  MakeConfirmationAlertPropsOption,
  MakeDisplayOptionsPropsOptions,
  MakeFilterPropsOptions,
  MakeListPropsOptions,
  RecordType,
} from '@apps-next/core';
import { MakeComboboxPropsOptions } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { Outlet } from '@tanstack/react-router';
import React from 'react';
import {
  RenderComboboxPopover,
  RenderCommandbar,
  RenderCommandform,
  RenderConfirmationAlert,
  RenderContextmenu,
  RenderDatePickerDialog,
  RenderDisplayOptions,
  RenderFilter,
  RenderInputDialog,
  RenderList,
  RenderSaveViewDropdown,
} from './default-components';

export const DefaultViewTemplate = observer(
  <T extends RecordType>(props: {
    listOptions?: MakeListPropsOptions<T>;
    comboboOptions?: MakeComboboxPropsOptions<T>;
    filterOptions?: MakeFilterPropsOptions<T>;
    displayOptions: MakeDisplayOptionsPropsOptions<T>;
    confirmationAlertOptions?: MakeConfirmationAlertPropsOption<T>;
    RenderInputDialog?: React.FC;
  }) => {
    return (
      <>
        <div className="p-2 flex flex-col gap-2 grow overflow-scroll">
          <div className="flex flex-row w-full justify-between">
            <div className="grow pr-12">
              <RenderFilter options={props.filterOptions} />
            </div>

            <div className="flex flex-row gap-2 mr-4 items-center">
              <RenderDisplayOptions options={props.displayOptions} />

              <RenderSaveViewDropdown />
            </div>
          </div>

          {props.RenderInputDialog ? (
            <props.RenderInputDialog />
          ) : (
            <RenderInputDialog />
          )}

          <RenderContextmenu />

          <div className="flex flex-col w-full ">
            <RenderList options={props.listOptions} />
          </div>
          <hr />

          <Outlet />
        </div>

        <RenderConfirmationAlert options={props.confirmationAlertOptions} />

        <RenderCommandbar />

        <RenderCommandform />

        <RenderDatePickerDialog />

        <RenderComboboxPopover options={props.comboboOptions} />
        {/* <AlertDialogDemo /> */}
      </>
    );
  }
);
