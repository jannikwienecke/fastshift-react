import {
  MakeConfirmationAlertPropsOption,
  MakeDisplayOptionsPropsOptions,
  MakeFilterPropsOptions,
  MakeListPropsOptions,
  RecordType,
} from '@apps-next/core';
import { MakeComboboxPropsOptions, store$ } from '@apps-next/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  datePickerModal,
} from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import { Outlet } from '@tanstack/react-router';
import React from 'react';
import {
  RenderComboboxPopover,
  RenderCommandbar,
  RenderConfirmationAlert,
  RenderContextmenu,
  RenderDatePickerDialog,
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
    confirmationAlertOptions?: MakeConfirmationAlertPropsOption<T>;
    RenderInputDialog?: React.FC;
  }) => {
    return (
      <>
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

        <RenderConfirmationAlert options={props.confirmationAlertOptions} />

        <RenderCommandbar />

        <RenderDatePickerDialog />
        {/* <AlertDialogDemo /> */}
      </>
    );
  }
);
