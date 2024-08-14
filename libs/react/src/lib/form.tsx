import { api } from '@apps-next/convex';
import { useConvexMutation } from '@convex-dev/react-query';
import { useMutation } from '@tanstack/react-query';
import { useViewConfig } from './use-view-config';

export const Form = () => {
  const { viewConfig } = useViewConfig();
  console.log({ viewConfig });

  const { mutate, isPending } = useMutation({
    mutationFn: useConvexMutation(api.query.mutation),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);

        const name = formData.get('name') as string;
        const completed = formData.get('completed');

        mutate({ name, completed: completed === 'on' });
      }}
    >
      <div className="pb-6 justify-end flex flex-col space-y-2 w-[20rem]">
        {viewConfig.getViewFieldList().map((field) => {
          const StringInput = () => {
            return (
              <input
                name={field.name}
                className="border border-black p-1 px-4 rounded-md"
                placeholder={'Enter ' + field.name}
              />
            );
          };
          const BooleanInput = () => {
            return (
              <div className="flex flex-row items-center space-x-2">
                <div>{field.name}</div>
                <input
                  name={field.name}
                  className="border border-black p-1 px-4 rounded-md"
                  type="checkbox"
                />
              </div>
            );
          };

          const dict = {
            String: StringInput,
            Number: StringInput,
            Boolean: BooleanInput,
            Date: StringInput,
          };

          const Input = dict[field.type];
          return <Input />;
        })}

        <button
          type="submit"
          className="border border-red-500 p-1 px-4 rounded-md"
        >
          Save
        </button>
      </div>
    </form>
  );
};
