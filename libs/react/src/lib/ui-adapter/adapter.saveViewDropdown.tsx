import { FilterType, RecordType, SaveViewDropdownProps } from '@apps-next/core';
import { store$ } from '../legend-store';
import { getParsedViewSettings } from '../legend-store/legend.utils.helper';

type Props<T> = {
  // Add any specific properties for the Props type here
};

export const makeSaveViewDropdownProps = <T extends RecordType>(
  options?: Props<T>
): SaveViewDropdownProps => {
  const parsedViewSettings = getParsedViewSettings();

  const form = store$.userViewSettings.form.get();
  return {
    show: store$.userViewSettings.hasChanged.get(),
    form: form
      ? {
          ...form,
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
            const result = await store$.api.mutateAsync({
              query: '',
              viewName: store$.viewConfigManager.getViewName(),
              mutation: {
                type: 'USER_VIEW_MUTATION',
                payload: {
                  type: 'CREATE_VIEW',
                  name: form.viewName,
                  ...parsedViewSettings,
                },
              },
            });

            if (result.success) {
              store$.userViewSettings.form.set(undefined);
              store$.userViewSettings.open.set(false);
              store$.userViewSettings.hasChanged.set(false);
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
      }
    },
    async onSave() {
      console.log('Save View');
      const result = await store$.api.mutateAsync({
        query: '',
        viewName: store$.viewConfigManager.getViewName(),
        mutation: {
          type: 'USER_VIEW_MUTATION',
          payload: {
            type: 'UPDATE_VIEW',
            name:
              store$.userViewData.get()?.name ??
              store$.viewConfigManager.getViewName(),

            ...parsedViewSettings,
          },
        },
      });
    },
    async onSaveAsNewView() {
      console.log('Save As New View');

      store$.userViewSettings.form.set({
        type: 'create',
        viewName: '',
        viewDescription: '',
        iconName: undefined,
      });
    },
  } satisfies SaveViewDropdownProps;
};
