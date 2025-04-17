import {
  MakeConfirmationAlertPropsOption,
  MakeDisplayOptionsPropsOptions,
  MakeFilterPropsOptions,
  MakeListPropsOptions,
  RecordType,
} from '@apps-next/core';
import { MakeComboboxPropsOptions, store$ } from '@apps-next/react';
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
  RenderSaveViewDropdown,
  RenderUserViewForm,
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
    const { id } = useParams({ strict: false });
    return (
      <>
        {!id ? (
          <div className="p-2 flex flex-col gap-2 grow overflow-scroll">
            {store$.userViewSettings.form.get() ? (
              <div className="ml-8 my-1 border-[1px] border-solid p-2 rounded-md border-gray-100">
                <RenderUserViewForm />
              </div>
            ) : null}

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

            <RenderContextmenu />

            <div className="flex flex-col w-full ">
              <RenderList options={props.listOptions} />
            </div>
            <hr />

            <Outlet />
          </div>
        ) : null}

        <RenderConfirmationAlert options={props.confirmationAlertOptions} />
        <RenderCommandbar />
        <RenderCommandform />
        <RenderDatePickerDialog />
        <RenderComboboxPopover options={props.comboboOptions} />
      </>
    );
  }
);
