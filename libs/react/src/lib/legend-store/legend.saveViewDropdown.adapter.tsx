import {
  FilterType,
  RecordType,
  SaveViewDropdownProps,
  slugHelper,
} from '@apps-next/core';
import { store$ } from '.';
import { updateExisitingView } from './legend.saveViewDropdown.helper';
import { userView$ } from './legend.shared.derived';
import { getParsedViewSettings } from './legend.utils.helper';

type Props<T> = {
  // Add any specific properties for the Props type here
};

export const makeSaveViewDropdownProps = <T extends RecordType>(
  options?: Props<T>
): SaveViewDropdownProps => {
  const form = store$.userViewSettings.form.get();

  return {
    show: store$.userViewSettings.hasChanged.get(),
    form: form
      ? {
          ...form,
          emoji: form.emoji ?? undefined,
          viewName: form.viewName ?? '',
          onCancel: () => {
            store$.userViewSettings.form.set(undefined);
          },
          onNameChange: (name: string) => {
            store$.userViewSettings.form.viewName.set(name);
          },
          onDescriptionChange: (description: string) => {
            store$.userViewSettings.form.viewDescription.set(description);
          },

          onEmojiChange(emoji) {
            store$.userViewSettings.form.emoji.set(emoji);
          },

          onSave: async () => {
            const formType = form.type;

            const onSuccess = () => {
              store$.userViewSettings.form.set(undefined);
              store$.userViewSettings.open.set(false);
              store$.userViewSettings.hasChanged.set(false);

              store$.userViewSettings.viewCreated.set({
                name: form.viewName,
                slug: slugHelper().slugify(form.viewName),
              });

              const displayOptions = store$.displayOptions.get();
              const filters = store$.filter.filters.get();
              const copyOfDisplayOptions = JSON.parse(
                JSON.stringify(displayOptions)
              );
              const copyOfFilters = JSON.parse(JSON.stringify(filters));

              store$.userViewSettings.initialSettings.set({
                displayOptions: copyOfDisplayOptions,
                filters: copyOfFilters,
              });
            };

            if (formType === 'edit' && userView$.get()) {
              const { queryData, queryKey } = updateExisitingView() ?? {};

              store$.updateViewMutation(
                {
                  id: userView$.get()?.id ?? '',
                  name: form.viewName,
                  description: form.viewDescription,
                  emoji: form.emoji,
                  slug: slugHelper().slugify(form.viewName),
                },
                () => {
                  store$.api.queryClient.setQueryData(queryKey, queryData);

                  onSuccess();
                }
              );
            } else {
              store$.createViewMutation(onSuccess);
            }
          },
        }
      : undefined,

    onReset: () => {
      const initial = store$.userViewSettings.initialSettings.get();

      if (initial?.filters.length) {
        const copyOf = JSON.parse(
          JSON.stringify(initial.filters)
        ) as FilterType[];

        store$.filter.filters.set(copyOf);
      } else {
        store$.filter.filters.set([]);
      }

      if (initial?.displayOptions) {
        const copyOf = JSON.parse(JSON.stringify(initial.displayOptions));

        store$.displayOptions.set({
          ...copyOf,
          isOpen: store$.displayOptions.isOpen.get(),
        });
        store$.displayOptions.sorting.isOpen.set(false);
      }
    },
    async onSave() {
      store$.updateViewMutation(
        {
          id: userView$.get()?.id ?? '',
          ...getParsedViewSettings(),
        },
        () => {
          const displayOptions = store$.displayOptions.get();
          const filters = store$.filter.filters.get();
          const copyOfDisplayOptions = JSON.parse(
            JSON.stringify(displayOptions)
          );
          const copyOfFilters = JSON.parse(JSON.stringify(filters));

          store$.userViewSettings.form.set(undefined);
          store$.userViewSettings.open.set(false);
          store$.userViewSettings.hasChanged.set(false);

          store$.userViewSettings.initialSettings.set({
            displayOptions: copyOfDisplayOptions,
            filters: copyOfFilters,
          });
        }
      );
    },
    async onSaveAsNewView() {
      store$.userViewSettings.form.set({
        type: 'create',
        viewName: '',
        viewDescription: '',
        iconName: undefined,
      });
    },
  } satisfies SaveViewDropdownProps;
};
