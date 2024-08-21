import { FormField, FormRecord } from '../form.types';

export const StringInput = (props: FormField<FormRecord>) => {
  return (
    <>
      <input
        {...props}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
        className="border border-black p-1 px-4 rounded-md"
      />

      {props.error?.message && <div>{props.error.message}</div>}
    </>
  );
};
