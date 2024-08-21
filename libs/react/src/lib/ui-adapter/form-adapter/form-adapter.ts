import {
  ID,
  RecordType,
  useStoreDispatch,
  useStoreValue,
} from '@apps-next/core';
import { FormProps } from '@apps-next/ui';
import { useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { formAtom, initialFormAtom } from './form.store';
import { useMutation } from '../../use-mutation';

export const useForm = <T extends RecordType>(): (() => FormProps<T>) => {
  const { edit } = useStoreValue();
  const res = useAtomValue<FormProps<T>>(initialFormAtom);
  const set = useSetAtom(formAtom);

  const dispatch = useStoreDispatch();

  const getFormProps = (): FormProps<T> => {
    return res;
  };

  const { mutateAsync } = useMutation();

  React.useEffect(() => {
    if (edit.isEditing) {
      set({
        onSubmit: (mutation) =>
          mutateAsync({
            mutation: mutation,
          }),
      });
    }
  }, [edit.isEditing, mutateAsync, set]);

  return getFormProps;
};
