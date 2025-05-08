import {
  MakeConfirmationAlertPropsOption,
  MakeDisplayOptionsPropsOptions,
  MakeFilterPropsOptions,
  MakeListPropsOptions,
  RecordType,
} from '@apps-next/core';
import {
  MakeComboboxPropsOptions,
  store$,
  viewRegistry,
} from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import { Outlet, useParams } from '@tanstack/react-router';
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
  RenderPageHeader,
  RenderSaveViewDropdown,
  RenderUserViewForm,
} from './default-components';

export const DefaultViewTemplate = observer(
  <T extends RecordType>(props: {
    listOptions?: MakeListPropsOptions<T>;
    comboboOptions?: MakeComboboxPropsOptions<T>;
    filterOptions?: MakeFilterPropsOptions<T>;
    displayOptions?: MakeDisplayOptionsPropsOptions<T>;
    confirmationAlertOptions?: MakeConfirmationAlertPropsOption<T>;
    RenderInputDialog?: React.FC;
    isSubView?: boolean;
  }) => {
    const { id } = useParams({ strict: false });

    if (props.isSubView) {
      return (
        <div className="p-2 flex flex-col gap-2 grow overflow-scroll">
          <div className="flex flex-row w-full justify-between">
            <div className="grow pr-12 pl-8">
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

          <div className="flex flex-col w-full ">
            <RenderList options={props.listOptions} />
          </div>
          <hr className="border-none" />

          <Outlet />
        </div>
      );
    }

    return (
      <>
        {!id ? (
          <div className="pb-2 pt-1 flex flex-col grow overflow-scroll">
            {store$.userViewSettings.form.get() ? (
              <div className="ml-8 my-1 border-[1px] border-solid p-2 rounded-md border-gray-100">
                <RenderUserViewForm />
              </div>
            ) : null}

            <div className="flex flex-row w-full justify-between border-gray-100 border-t-[1px] border-b-[1px] text-sm py-2 items-center">
              <div className="pl-8">
                <RenderPageHeader />
              </div>
            </div>

            <div className="flex flex-row w-full justify-between border-gray-100 border-b-[1px] border-collapse items-center py-1">
              <div className="grow pr-12 pl-8">
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

            <div className="flex flex-col w-full ">
              <RenderList options={props.listOptions} />
            </div>
            <hr />

            <Outlet />
          </div>
        ) : null}

        <RenderContextmenu />
        <RenderConfirmationAlert options={props.confirmationAlertOptions} />
        <RenderCommandbar />
        <RenderCommandform />
        <RenderDatePickerDialog />
        <RenderComboboxPopover options={props.comboboOptions} />
      </>
    );
  }
);
