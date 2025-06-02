import { _log, slugHelper } from '@apps-next/core';
import { renderErrorToast } from '../toast';
import {
  currentView$,
  detailUserView$,
  detailView$,
  parentView$,
  userViews$,
} from './legend.shared.derived';
import { StoreFn } from './legend.store.types';
import { getParsedViewSettings } from './legend.utils.helper';
import { createSubViewName } from './legend.utils';

export const createViewMutation: StoreFn<'createViewMutation'> =
  (store$) => async (form, record, onSuccess) => {
    if (!form) {
      throw new Error('Form is required');
    }

    const result = await store$.api.mutateAsync({
      query: '',
      viewName: currentView$.viewName.get(),
      mutation: {
        type: 'NEW_USER_VIEW_MUTATION',
        payload: {
          type: 'CREATE_NEW_VIEW',
          record: {
            ...getParsedViewSettings(),
            baseView: currentView$.viewName.get(),
            description: form.viewDescription,
            name: form.viewName,
            slug: slugHelper().slugify(form.viewName),
            ...(record || {}),
          },
        },
      },
    });

    if (result.error) {
      renderErrorToast(result.error.message, () => {
        store$.errorDialog.error.set(result.error);
      });
    } else {
      onSuccess?.();
    }
  };

export const updateViewMutation: StoreFn<'updateViewMutation'> =
  (store$) => async (_record, onSuccess) => {
    const { id, ...record } = _record;

    const userViewData = userViews$.find((v) => v.id.get() === id)?.get();

    if (!userViewData) {
      return store$.createViewMutation(
        {
          viewName: currentView$.viewName.get(),
          viewDescription: '',
          type: 'create',
        },
        { ...record },
        onSuccess
      );
    }

    const copyOfOriginal = {
      ...userViewData,
    };

    store$.userViewData.set((prev) => (prev ? { ...prev, ...record } : prev));

    const result = await store$.api.mutateAsync({
      query: '',
      viewName: currentView$.viewName.get(),
      mutation: {
        type: 'NEW_USER_VIEW_MUTATION',
        payload: {
          type: 'UPDATE_VIEW',
          record,
          userViewId: userViewData.id,
        },
      },
    });

    if (result.error && copyOfOriginal) {
      _log.debug(
        `Error updating view: Rollbaclk to original state. Error: ${result.error.message}`
      );
      store$.userViewData.set(copyOfOriginal);

      renderErrorToast(result.error.message, () => {
        store$.errorDialog.error.set(result.error);
      });
    } else {
      onSuccess?.();
    }
  };

export const saveSubUserView: StoreFn<'saveSubUserView'> =
  (store$) => async () => {
    const parentView = parentView$.get();
    const view = currentView$.get();

    if (!parentView) return;

    const name = createSubViewName(parentView, view);

    const existingSubView = store$.userViews
      .find((v) => v.name.get() === name)
      ?.get();

    if (!existingSubView) {
      console.debug('saveSubUserView::CREATE_SUB_VIEW: ', name);
      await store$.api.mutateAsync({
        query: '',
        viewName: currentView$.viewName.get(),
        mutation: {
          type: 'NEW_USER_VIEW_MUTATION',
          payload: {
            type: 'CREATE_SUB_VIEW',
            userViewData: {
              ...getParsedViewSettings(),
              baseView: '',
              description: '',
              name: name,
              slug: '',
            },
          },
        },
      });
    } else {
      console.debug('saveSubUserView::UPDATE_SUB_VIEW: ', name);

      await store$.api.mutateAsync({
        query: '',
        viewName: currentView$.viewName.get(),
        mutation: {
          type: 'NEW_USER_VIEW_MUTATION',
          payload: {
            type: 'UPDATE_SUB_VIEW',
            userViewId: existingSubView.id,
            userViewData: {
              ...getParsedViewSettings(),
            },
          },
        },
      });
    }
  };

export const updateDetailViewMutation: StoreFn<'updateDetailViewMutation'> =
  (store$) => async (record) => {
    const baseView = parentView$.get()?.viewName;

    const view = detailUserView$.get();

    if (view) {
      await store$.api.mutateAsync({
        query: '',
        viewName: currentView$.viewName.get(),
        mutation: {
          type: 'NEW_USER_VIEW_MUTATION',
          payload: {
            type: 'UPDATE_VIEW',
            record,
            userViewId: view.id,
          },
        },
      });

      return;
    }
    await store$.api.mutateAsync({
      query: '',
      viewName: currentView$.viewName.get(),
      mutation: {
        type: 'NEW_USER_VIEW_MUTATION',
        payload: {
          type: 'CREATE_DETAIL_VIEW',
          userViewData: {
            ...record,
            name: store$.detail.row.label.get(),
            slug: store$.detail.row.id.get(),
            rowId: store$.detail.row.id.get(),
            rowLabelFieldName:
              detailView$.get()?.displayField.field.toString() ?? '',
            baseView,
          },
        },
      },
    });
  };
