import { FormField, FormRecord } from '../form.types';

export const OneToOneSelectInput = (props: FormField<FormRecord>) => {
  const getProps = props.relation?.useCombobox?.({
    fieldName: props.name,
    selectedValue: props.value,
    connectedRecordId: '',
    name: props.name,
  });

  if (!getProps) return null;

  // TODO: implement
  return null;
};
