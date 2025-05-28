import { RightSidebarProps, Row } from '@apps-next/core';
import { observable } from '@legendapp/state';
import { currentView$, getView, userView$ } from './legend.shared.derived';
import { store$ } from './legend.store';
import {
  query$,
  listRows$,
  tab$,
  getIdsOfTable,
} from './legend.rightsidebar.state';

export const rightSidebarProps$ = observable(() => {
  const relationalFilterData = store$.relationalFilterData.get();

  const queryIsDone = store$.fetchMore.isDone.get();
  const stateIsFilterChanged = store$.state.get() === 'filter-changed';

  if (!currentView$.get()) return {} as RightSidebarProps;

  return {
    isOpen: store$.rightSidebar.open.get(),
    onClose: () => {
      store$.rightSidebar.open.set(false);
    },
    viewName: (userView$.get()?.name || currentView$.get()?.viewName) ?? '',
    tableName: currentView$.get().tableName,
    viewIcon: currentView$.get().icon,
    tabs: {
      listRows: listRows$.get(),
      relationalFilterData: relationalFilterData,
      currentFilter: store$.rightSidebar.filter.get(),
      getView: getView,
      userViews: store$.userViews.get(),
      query: query$.get(),
      activeTab: tab$.get(),

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
      setFilter: (filter) => store$.rightSidebar.filter.set(filter),
    },
  } satisfies RightSidebarProps;
});
