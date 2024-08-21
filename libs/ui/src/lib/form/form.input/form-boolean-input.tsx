import { FormField, FormRecord } from '../form.types';

export const BooleanInput = (props: FormField<FormRecord>) => {
  return (
    <div className="flex flex-row items-center space-x-2">
      <div>{props.placeholder}</div>
      <input
        value={props.value}
        placeholder={props.placeholder}
        defaultChecked={props.value}
        className="border border-black p-1 px-4 rounded-md"
        type="checkbox"
      />
    </div>
  );
};
