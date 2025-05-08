import {
  _log,
  convertFiltersForBackend,
  FilterType,
  RecordType,
  SaveViewDropdownProps,
  slugHelper,
} from '@apps-next/core';
import { store$ } from '../legend-store';
import { getParsedViewSettings } from '../legend-store/legend.utils.helper';
import { renderErrorToast } from '../toast';

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
          viewName: store$.userViewSettings.form.viewName.get() ?? '',
          onCancel: () => {
            store$.userViewSettings.form.set(undefined);
          },
          onNameChange: (name: string) => {
            store$.userViewSettings.form.viewName.set(name);
          },
          onDescriptionChange: (description: string) => {
            store$.userViewSettings.form.viewDescription.set(description);
          },

          onSave: async () => {
            store$.createViewMutation(() => {
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
            });
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
