import { RightSidebarProps, Row } from '@apps-next/core';
import { observable } from '@legendapp/state';
import {
  getIdsOfTable,
  hasRightSidebarFiltering,
  isDone$,
  listRows$,
  query$,
  tab$,
} from './legend.rightsidebar.state';
import { currentView$, getView, userView$ } from './legend.shared.derived';
import { store$ } from './legend.store';
import { viewActions } from './legend.utils.helper';
import { getCommandGroups } from '../commands/commands.get';

export const rightSidebarProps$ = observable(() => {
  const relationalFilterData = store$.relationalFilterData.get();

  const queryIsDone = isDone$.get();
  const stateIsFilterChanged = store$.state.get() === 'filter-changed';

  if (!currentView$.get()) return {} as RightSidebarProps;

  return {
    isOpen: hasRightSidebarFiltering() && store$.rightSidebar.open.get(),

    onClose: () => {
      store$.rightSidebar.open.set(false);
    },
    onToggleFavorite: () => {
      viewActions().toggleFavorite();
    },

    commandsDropdownProps: {
      onOpenCommands: () => {
        store$.commandsDialog.type.set('view');
      },
      onSelectCommand: (command) => {
        command.handler?.({ row: undefined, field: undefined, value: command });
      },
      commands: getCommandGroups().filter((g) =>
        g.items.find((i) => i.command === 'view-commands')
      ),
    },

    starred: store$.userViewData.starred.get() ?? false,

    viewName: (userView$.get()?.name || currentView$.get()?.viewName) ?? '',
    tableName: currentView$.get().tableName,
    viewIcon: currentView$.get().icon,
    tabs: {
      listQueryIsDone: queryIsDone,
      listRows: listRows$.get(),
      relationalFilterData: relationalFilterData,
      currentFilter: store$.rightSidebar.filter.get(),
      getView: getView,
      query: query$.get(),
      activeTab: tab$.get(),

      getUserView: (viewName) =>
        store$.userViews.get().find((v) => v.name === viewName),
      getTabProps: (tabName) => {
        const ids = getIdsOfTable(tabName);
        const getCount = (row: Row) =>
          queryIsDone || stateIsFilterChanged
            ? ids.filter((id) => id === row.id).length
            : row.raw.count || 0;

        return {
          ids,
          icon: getView(tabName)?.icon,
          getCountForRow: getCount,
          shouldNotRender: (row) => {
            return getCount(row) === 0 && (queryIsDone || stateIsFilterChanged);
          },
        };
      },
      onQueryChange: (q) => query$.set(q),
      onTabChange: (tab) => tab$.set(tab),
      setFilter: (filter) => {
        store$.rightSidebar.filter.set(filter);
        store$.state.set('temp-filter-changed');
      },
    },
  } satisfies RightSidebarProps;
});
