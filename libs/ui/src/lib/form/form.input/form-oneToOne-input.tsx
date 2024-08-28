import { FormField, FormRecord } from '../form.types';

export const OneToOneSelectInput = (props: FormField<FormRecord>) => {
  const getProps = props.relation?.useCombobox?.({
    fieldName: props.name,
    placeholder: props.placeholder,
    value: props.value,
    connectedRecordId: '',
    name: props.name,
    uniqueId: props.name,
  });

  if (!getProps) return null;

  // TODO: implement
  return null;
};
