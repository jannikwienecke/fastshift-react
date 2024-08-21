import { FormProps, FormRecord } from './form.types';

export const Form = <T extends FormRecord>(props: FormProps<T>) => {
  console.log('Form', props);

  return (
    <form
      onSubmit={(e) => {
        console.log('submit');
        e.preventDefault();

        // const formData = new FormData(e.target as any);

        // const formValues: Record<string, any> = {};

        // viewConfigManager.getViewFieldList().forEach((field) => {
        //   const value = formData.get(field.name);
        //   const isBoolean = field.type === 'Boolean';
        //   const isIdField = field.isId;

        //   if (isIdField) return;
        //   if (field.isRelationalIdField) {
        //     // FIX: Hardcoded for now -> later have select value
        //     formValues[field.name] = 'j97axm7vxkhy23tad71gdtq5b96z3ysq';
        //     // formValues[field.name] = 1;
        //   } else if (field.relation) {
        //     //
        //   } else {
        //     formValues[field.name] =
        //       isBoolean && typeof value !== 'boolean' ? false : value;
        //   }
        // });

        // mutate({
        //   mutation: {
        //     type: 'CREATE_RECORD',
        //     record: formValues,
        //   },
        // });

        // resetForm();
      }}
    >
      <div className="pb-6 justify-end flex flex-col space-y-2 w-[20rem]">
        {props.fields.map(({ Component, ...field }) => {
          return (
            <span key={`form-field-${field.name.toString()}`}>
              <Component {...field} />
            </span>
          );
          //   return (
          //     <div key={field.name}>
          //       <Input
          //         {...field}
          //         // onChange={(e: any) =>
          //         //   updateFormValue({
          //         //     field: field.name,
          //         //     value: e.target.value,
          //         //   })
          //         // }
          //       />
          //     </div>
          //   );
        })}

        <button
          disabled={!props.ready}
          type="submit"
          onClick={() => console.log('click')}
          className="border border-red-500 p-1 px-4 rounded-md"
        >
          Save
        </button>
      </div>
    </form>
  );
};
