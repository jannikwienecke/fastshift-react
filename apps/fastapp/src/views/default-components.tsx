import {
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
  ConfirmationDialog,
  ContextMenuDefault,
  datePickerModal,
  DisplayOptions,
  Filter,
  InputDialog,
  List,
} from '@apps-next/ui';
import { Memo, observer } from '@legendapp/state/react';
import { TaskViewDataType } from '../views/tasks.components';

export const RenderComboboxPopover = observer(
  ({ options }: { options?: MakeComboboxPropsOptions }) => {
    console.warn('Render Combobox Popover');
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
    console.warn('Render Filter');
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
  ({ options }: { options: MakeDisplayOptionsPropsOptions }) => {
    const { makeDisplayOptionsProps } = makeHooks<TaskViewDataType>();
    const props = makeDisplayOptionsProps(options);

    return (
      <div className="mr-8">
        <DisplayOptions.Default {...props} />
      </div>
    );
  }
);

export const RenderInputDialog = observer(
  (props: { options?: MakeInputDialogPropsOptions }) => {
    console.warn('Render Input Dialog');
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
    console.warn('Render List');

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
  (props: { options?: MakeConfirmationAlertPropsOption }) => {
    const { makeCommandbarProps } = makeHooks<TaskViewDataType>();

    return (
      <Memo>
        {() => {
          return <commandbar.default {...makeCommandbarProps({})} />;
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

    return (
      <Memo>
        {() => {
          return <datePickerModal.default {...makeDatePickerDialogProps({})} />;
        }}
      </Memo>
    );
  }
);
