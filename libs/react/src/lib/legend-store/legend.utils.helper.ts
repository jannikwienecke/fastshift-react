import {
  _log,
  CommandsDropdownProps,
  convertDisplayOptionsForBackend,
  convertFiltersForBackend,
  DEFAULT_FETCH_LIMIT_QUERY,
  getViewByName,
  Row,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { applyDisplayOptions } from './legend.local.display-options';
import { detailUserView$, userView$ } from './legend.shared.derived';
import { store$ } from './legend.store';
import { LegendStore } from './legend.store.types';
import { getViewConfigManager, isDetail } from './legend.utils';
import { viewRegistry } from './legend.app.registry';

export const filterRowsByShowDeleted = (rows: Row[]) => {
  const showDeleted = store$.displayOptions.showDeleted.get();
  const softDeleteField =
    store$.viewConfigManager.getSoftDeleteIndexField()?.field;

  const filtered = rows.filter((row) => {
    if (showDeleted) return true;

    const value = softDeleteField && row.getValue(softDeleteField ?? '');
    return showDeleted ? true : value !== true;
  });

  return filtered;
};

const filterRowsByParentId = (rows: Row[]) => {
  const parentId = store$.detail.row.id.get();
  const parentViewName = store$.detail.parentViewName.get();

  if (!parentId || !parentViewName) return rows;
  const parentTableName = getViewByName(
    store$.views.get(),
    parentViewName
  )?.tableName;

  if (!parentTableName) return rows;

  return rows.filter((row) => {
    const value = row.raw?.[parentTableName];

    if (!value) return true;
    if (!value?.id) return true;

    const id = value.id;
    if (id === parentId) return true;

    return false;
  });
};

export const setGlobalDataModel = (rows: Row[]) => {
  // if (store$.detail.form.dirtyValue.get()) {
  //   console.debug('DOES NOT UPDATE IS DIRY!!', store$.detail.form.get());
  //   return;
  // }

  rows = filterRowsByParentId(rows);

  const filteredRows = filterRowsByShowDeleted(rows);

  //   datamodel has either ALL or not DELETED rows based on the config
  store$.dataModel.set((prev) => {
    return {
      ...prev,
      rows: filteredRows,
    };
  });

  //   backup has ALL rows
  store$.dataModelBackup.rows.set(rows);

  const isDone_ =
    DEFAULT_FETCH_LIMIT_QUERY > store$.dataModel.rows.get().length;

  if (localModeEnabled$.get() || isDone_) {
    _log.debug('setGlobalDataModel: APPLY FILTER! AND SORT');
    applyDisplayOptions(store$, store$.displayOptions.get());
  }
};

export const getParsedViewSettings = () => {
  const filters = store$.filter.filters.get();
  const displayOptions = store$.displayOptions.get();

  const parsedDisplayOptions = convertDisplayOptionsForBackend(displayOptions);

  return {
    filters: convertFiltersForBackend(filters),
    displayOptions: parsedDisplayOptions,
  } satisfies {
    filters?: string;
    displayOptions?: string;
  };
};

export const localModeEnabled$ = observable(() => {
  const parentViewName = store$.detail.parentViewName.get();

  return (
    store$.viewConfigManager.viewConfig.localMode.enabled.get() ||
    parentViewName
  );
});

export const viewActions = () => {
  const userViewData = isDetail() ? detailUserView$.get() : userView$.get();

  const starred = isDetail()
    ? !detailUserView$.get()?.starred
    : userViewData?.starred !== undefined
    ? !userViewData.starred
    : true;

  const toggleFavorite = () => {
    store$.ignoreNextUserViewData.set((prev) => prev + 1);

    store$.userViews.set((prev) => {
      const updatedViews = prev.map((view) => {
        if (view.id === userViewData?.id) {
          return {
            ...view,
            starred:
              userViewData?.starred !== undefined
                ? !userViewData.starred
                : true,
          };
        }
        return view;
      });
      return updatedViews;
    });

    if (isDetail()) {
      store$.updateDetailViewMutation({
        id: userViewData?.id,
        starred,
      });
    } else {
      store$.updateViewMutation({
        id: userViewData?.id,
        starred,
      });
    }
  };

  return {
    toggleFavorite,
  };
};

export const dispatchDeleteMutation = (runMutation: () => void) => {
  const viewConfigManager = getViewConfigManager();

  if (viewConfigManager.getUiViewConfig()?.onDelete?.showConfirmation) {
    store$.confirmationAlert.open.set(true);
    store$.confirmationAlert.title.set('confirmationAlert.delete.title');
    store$.confirmationAlert.description.set(
      'confirmationAlert.delete.description'
    );

    store$.confirmationAlert.onConfirm.set({
      cb: runMutation,
    });
  } else {
    runMutation();
  }
};

const timeoutRef$ = observable<number | null>(null);
export const getCommandsDropdownProps = ({
  commands,
  view,
}: Pick<CommandsDropdownProps, 'commands'> & {
  view: Exclude<LegendStore['commandsDisplay']['type'], 'closed'>;
}) => {
  const commandbarRow = store$.commandbar.activeRow.get() as Row | undefined;
  const detailRow = store$.detail.row.get() as Row | undefined;
  const row = commandbarRow || detailRow;

  return {
    onOpenCommands: (open) => {
      const prevRef = timeoutRef$.get();
      if (prevRef && open) {
        clearTimeout(prevRef);
        timeoutRef$.set(null);
      }

      const timeout = window.setTimeout(
        () => {
          store$.commandsDisplay.type.set(open ? view : 'closed');
        },
        open ? 0 : 500
      );

      timeoutRef$.set(timeout);
    },
    onSelectCommand: (command) => {
      command.handler?.({ row: row, field: undefined, value: command });
    },
    commands,
  } satisfies CommandsDropdownProps;
};
