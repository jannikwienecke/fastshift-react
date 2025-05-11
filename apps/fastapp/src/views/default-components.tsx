import {
  MakeCommandbarPropsOption,
  MakeCommandformPropsOption,
  MakeConfirmationAlertPropsOption,
  MakeDisplayOptionsPropsOptions,
  MakeFilterPropsOptions,
  MakeListPropsOptions,
  RecordType,
} from '@apps-next/core';
import {
  MakeComboboxPropsOptions,
  makeHooks,
  MakeInputDialogPropsOptions,
  useComboboxQuery,
} from '@apps-next/react';
import {
  ComboboxPopover,
  commandbar,
  Commandform,
  // commandform,
  ConfirmationDialog,
  ContextMenuDefault,
  datePickerModal,
  DisplayOptions,
  Filter,
  InputDialog,
  List,
  SaveViewDropdown,
  UserViewForm,
  pageHeader,
} from '@apps-next/ui';
import { Memo, observer } from '@legendapp/state/react';
import { TaskViewDataType } from '../views/tasks.components';

import { _log } from '@apps-next/core';

export const RenderComboboxPopover = observer(
  ({ options }: { options?: MakeComboboxPropsOptions }) => {
    // console.warn('Render Combobox Popover');
    _log.debug('Render Combobox Popover');
    const { makeComboboxProps } = makeHooks<RecordType>();

    return (
      <>
        <Memo>
          {() => {
            useComboboxQuery();
            return <ComboboxPopover {...makeComboboxProps(options)} />;
          }}
        </Memo>
      </>
    );
  }
);

export const RenderFilter = observer(
  ({ options }: { options?: MakeFilterPropsOptions }) => {
    _log.debug('Render Filter');
    const { makeFilterProps } = makeHooks<TaskViewDataType>();
    return (
      <Memo>
        {() => {
          return <Filter.Default {...makeFilterProps(options)} />;
        }}
      </Memo>
    );
  }
);

export const RenderDisplayOptions = observer(
  (options?: { options?: MakeDisplayOptionsPropsOptions }) => {
    const { makeDisplayOptionsProps } = makeHooks<TaskViewDataType>();
    const props = makeDisplayOptionsProps(options?.options);

    return <DisplayOptions.Default {...props} />;
  }
);

export const RenderInputDialog = observer(
  (props: { options?: MakeInputDialogPropsOptions }) => {
    _log.debug('Render Input Dialog');
    const { makeInputDialogProps } = makeHooks<TaskViewDataType>();

    return (
      <Memo>
        {() => {
          return (
            <InputDialog.Default {...makeInputDialogProps(props.options)} />
          );
        }}
      </Memo>
    );
  }
);

export const RenderList = observer(
  (props: { options?: MakeListPropsOptions }) => {
    const { makeListProps } = makeHooks<TaskViewDataType>();

    return (
      <Memo>
        {() => {
          return <List.Default {...makeListProps(props.options)} />;
        }}
      </Memo>
    );
  }
);

export const RenderContextmenu = observer(() => {
  const { makeContextmenuProps } = makeHooks<TaskViewDataType>();
  _log.debug('Render Contextmenu');
  return (
    <Memo>
      {() => {
        return <ContextMenuDefault {...makeContextmenuProps({})} />;
      }}
    </Memo>
  );
});

export const RenderConfirmationAlert = observer(
  (props: { options?: MakeConfirmationAlertPropsOption }) => {
    const { makeConfirmationAlertProps } = makeHooks<TaskViewDataType>();
    _log.debug('Render Confirmation Alert');
    return (
      <Memo>
        {() => {
          return (
            <ConfirmationDialog.Default
              {...makeConfirmationAlertProps(props.options)}
            />
          );
        }}
      </Memo>
    );
  }
);

export const RenderCommandbar = observer(
  (props: { options?: MakeCommandbarPropsOption }) => {
    const { makeCommandbarProps } = makeHooks<TaskViewDataType>();
    _log.debug('Render Commandbar');
    return (
      <Memo>
        {() => {
          return <commandbar.default {...makeCommandbarProps({})} />;
        }}
      </Memo>
    );
  }
);

export const RenderCommandform = observer(
  (props: { options?: MakeCommandformPropsOption }) => {
    const { makeCommandformProps } = makeHooks<TaskViewDataType>();
    _log.debug('Render Commandform');
    return (
      <Memo>
        {() => {
          return (
            <>
              <Commandform {...makeCommandformProps({})} />
            </>
          );
        }}
      </Memo>
    );
  }
);

export const RenderDatePickerDialog = observer(
  (props: {
    //
  }) => {
    const { makeDatePickerDialogProps } = makeHooks<TaskViewDataType>();
    _log.debug('Render DatePickerDialog');
    return (
      <Memo>
        {() => {
          return <datePickerModal.default {...makeDatePickerDialogProps({})} />;
        }}
      </Memo>
    );
  }
);

export const RenderSaveViewDropdown = observer(
  (options: {
    //
  }) => {
    const { makeSaveViewDropdownProps } = makeHooks<TaskViewDataType>();
    _log.debug('Render SaveViewDropdown');

    const props = makeSaveViewDropdownProps({
      show: false,
    });

    if (!props.show || props.form) return null;

    return (
      <Memo>
        {() => {
          return (
            <>
              <div className="h-[18px] w-[1px] bg-foreground/10 mx-2" />

              <SaveViewDropdown {...props} />
            </>
          );
        }}
      </Memo>
    );
  }
);

export const RenderUserViewForm = observer(
  (options: {
    //
  }) => {
    const { makeSaveViewDropdownProps } = makeHooks<TaskViewDataType>();
    // FIXME -> This rerenders on input change??
    // _log.info('Render RenderUserViewForm');

    const props = makeSaveViewDropdownProps({
      show: false,
    });

    return (
      // <Memo>
      //   {() => {
      //     return (
      <>
        <UserViewForm {...props} />
      </>
      //     );
      //   }}
      // </Memo>
    );
  }
);

export const RenderPageHeader = observer(
  (props: {
    //
  }) => {
    const { makePageHeaderProps } = makeHooks();

    return <pageHeader.default {...makePageHeaderProps(props)} />;
  }
);

export const RenderPageHeaderDetail = observer(
  (props: {
    //
  }) => {
    const { makePageHeaderProps } = makeHooks();

    return <pageHeader.defaultDetail {...makePageHeaderProps(props)} />;
  }
);
