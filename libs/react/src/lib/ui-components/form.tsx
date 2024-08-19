import { FieldConfig, FieldType } from '@apps-next/core';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useMutation } from '../use-mutation';
import { useViewConfig } from '../use-view-config';

const formAtom = atom<Record<string, any>>({});
// TODO CLEAN UP -> USE TANS STACK FORM
const updateFormValueAtom = atom(
  null,
  (get, set, update: { field: string; value: any }) => {
    const form = get(formAtom);

    set(formAtom, {
      ...form,
      [update.field]: update.value,
    });
  }
);

const resetFormAtom = atom(null, (get, set) => {
  set(formAtom, {});
});

const StringInput = ({
  value,
  onChange,
  field,
}: {
  field: FieldConfig;
  onChange: (e: any) => void;
  value: any;
}) => {
  return (
    <input
      name={field.name}
      value={value}
      onChange={onChange}
      className="border border-black p-1 px-4 rounded-md"
      placeholder={'Enter ' + field.name}
    />
  );
};

const BooleanInput = ({
  value,
  onChange,
  field,
}: {
  field: FieldConfig;
  onChange: (e: any) => void;
  value: any;
}) => {
  return (
    <div className="flex flex-row items-center space-x-2">
      <div>{field.name}</div>
      <input
        defaultChecked={false}
        name={field.name}
        value={value}
        onChange={onChange}
        className="border border-black p-1 px-4 rounded-md"
        type="checkbox"
      />
    </div>
  );
};

const dict: {
  [key in FieldType]: React.FC<any>;
} = {
  String: StringInput,
  Number: StringInput,
  Boolean: BooleanInput,
  Date: StringInput,
  Reference: StringInput,
  Union: StringInput,
};

export const Form = () => {
  const { viewConfigManager } = useViewConfig();
  const { mutate } = useMutation();

  const updateFormValue = useSetAtom(updateFormValueAtom);
  const resetForm = useSetAtom(resetFormAtom);
  const form = useAtomValue(formAtom);

  return (
    <form
      onSubmit={(e) => {
        console.log('submit');
        e.preventDefault();

        const formData = new FormData(e.target as any);

        const formValues: Record<string, any> = {};

        viewConfigManager.getViewFieldList().forEach((field) => {
          const value = formData.get(field.name);
          const isBoolean = field.type === 'Boolean';
          formValues[field.name] = isBoolean && value === null ? false : value;
        });

        mutate({
          mutation: {
            type: 'CREATE_RECORD',
            record: formValues,
          },
        });

        resetForm();
      }}
    >
      <div className="pb-6 justify-end flex flex-col space-y-2 w-[20rem]">
        {viewConfigManager.getViewFieldList().map((field) => {
          const Input = dict[field.type] || StringInput;

          const value = form[field.name];

          return (
            <div key={field.name}>
              <Input
                placeholder={field.name}
                field={field}
                value={value || ''}
                onChange={(e: any) =>
                  updateFormValue({
                    field: field.name,
                    value: e.target.value,
                  })
                }
              />
            </div>
          );
        })}

        <button
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
