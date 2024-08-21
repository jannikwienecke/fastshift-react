import { FormProps, FormRecord } from './form.types';

export const Form = <T extends FormRecord>(props: FormProps<T>) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formData = new FormData(e.target as any);
        props.onSubmit(formData);
      }}
    >
      <div className="pb-6 justify-end flex flex-col space-y-2 w-[20rem]">
        {props.fields.map(({ Component, ...field }) => {
          return (
            <span key={`form-field-${field.name.toString()}`}>
              <Component {...field} />
            </span>
          );
        })}

        <button
          disabled={!props.ready}
          type="submit"
          className="border border-red-500 p-1 px-4 rounded-md"
        >
          {props.isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};
