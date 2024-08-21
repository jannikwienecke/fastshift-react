import { RecordType, useStoreValue } from '@apps-next/core';
import { FormProps } from '@apps-next/ui';
import { useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { formAtom, initialFormAtom } from './form.store';

export const useForm = <T extends RecordType>(): (() => FormProps<T>) => {
  const { edit } = useStoreValue();
  const res = useAtomValue<FormProps<T>>(initialFormAtom);
  const set = useSetAtom(formAtom);

  const getFormProps = (): FormProps<T> => {
    return res;
  };

  React.useEffect(() => {
    set();
  }, [edit, set]);

  return getFormProps;
};
