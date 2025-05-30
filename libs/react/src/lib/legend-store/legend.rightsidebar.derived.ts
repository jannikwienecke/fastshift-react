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
