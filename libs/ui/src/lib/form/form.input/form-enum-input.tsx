import { FormField, FormRecord } from '../form.types';

export const EnumInput = (props: FormField<FormRecord>) => {
  return (
    <div className="flex flex-row items-center space-x-2">
      <div>{props.placeholder}</div>

      <select
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
        value={props.value}
      >
        {props.enum?.values.map((option) => (
          <option key={option.name} value={option.name}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};
