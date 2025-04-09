import { RecordType, SaveViewDropdownProps } from '@apps-next/core';
import { store$ } from '../legend-store';
import { getParsedViewSettings } from '../legend-store/legend.utils.helper';

type Props<T> = {
  // Add any specific properties for the Props type here
};

export const makeSaveViewDropdownProps = <T extends RecordType>(
  options?: Props<T>
): SaveViewDropdownProps => {
  const parsedViewSettings = getParsedViewSettings();

  return {
    async onSave() {
      console.log('Save View');
      const result = await store$.api.mutateAsync({
        query: '',
        viewName: store$.viewConfigManager.getViewName(),
        mutation: {
          type: 'USER_VIEW_MUTATION',
          payload: {
            type: 'CREATE_VIEW',
            name: 'new-user-view',

            ...parsedViewSettings,
          },
        },
      });

      console.log('Mutation Result:', result);
    },
    async onSaveAsNewView() {
      console.log('Save As New View');
      const result = await store$.api.mutateAsync({
        query: '',
        viewName: store$.viewConfigManager.getViewName(),
        mutation: {
          type: 'USER_VIEW_MUTATION',
          payload: {
            type: 'UPDATE_VIEW',
            name: 'new-user-view',

            ...parsedViewSettings,
          },
        },
      });

      console.log('Mutation Result:', result);
    },
  } satisfies SaveViewDropdownProps;
};
