import { Combobox } from '../../combobox';
import { FormField, FormRecord } from '../form.types';

export const OneToOneSelectInput = (props: FormField<FormRecord>) => {
  const getProps = props.relation?.useCombobox?.(props);

  if (!getProps) return null;

  return <Combobox {...getProps()} />;
};
