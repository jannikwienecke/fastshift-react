import { InputDialogProps } from '@apps-next/core';
import {
  InputDialogValueDict,
  useInputDialogStore,
} from './input-dialog.store';
import React from 'react';

export const useInputDialogAdapter = (props: {
  onSave: (valueDict: InputDialogValueDict) => void;
  onCancel?: () => void;
  defaultValue?: string;
}): (() => InputDialogProps) => {
  const { state, updateValue, close } = useInputDialogStore();

  React.useEffect(() => {
    if (props.defaultValue && state.field?.name) {
      updateValue({ name: state.field.name, value: props.defaultValue });
    }
  }, [props.defaultValue, state.field?.name, updateValue]);

  return () => {
    return {
      inputList: state.field
        ? [
            {
              id: state.field.name,
              value: state.valueDict?.[state.field.name]?.value ?? '',
              onChange: (e) => {
                if (!state.field) return;
                const value = e.target.value;
                updateValue({ name: state.field?.name, value });
              },
              placeholder: state.field.name,
            },
          ]
        : [],
      open: state.field !== null,
      title: 'Filter by ' + state.field?.name,
      onSubmit: () => {
        props.onSave(state.valueDict);
        close();
      },
      onCancel: () => {
        close();
        props.onCancel?.();
      },
      onOpenChange: (isOpen) => {
        if (!isOpen) {
          close();
          props.onCancel?.();
        }
      },
    };
  };
};
