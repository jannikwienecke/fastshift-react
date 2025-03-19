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
} from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import { Outlet } from '@tanstack/react-router';
import React from 'react';
import {
  RenderComboboxPopover,
  RenderCommandbar,
  RenderConfirmationAlert,
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
        {/* <AlertDialogDemo /> */}
      </>
    );
  }
);

export const AlertDialogDemo = observer(() => {
  // const [open, setOpen] = React.useState(false);
  const onOpenChange = (open: boolean) => {
    // setOpen(open);
    store$.confirmationAlert.open.set(open);

    // remove     /* pointer-events: none; from the body tag
  };

  return (
    <>
      <button
        onClick={() => {
          store$.confirmationAlert.open.set(true);
        }}
      >
        TOGGLE
      </button>

      <AlertDialog
        open={!!store$.confirmationAlert.open.get()}
        onOpenChange={onOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
