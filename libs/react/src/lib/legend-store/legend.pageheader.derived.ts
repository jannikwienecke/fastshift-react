import {
  CommandName,
  MakePageHeaderPropsOption,
  PageHeaderProps,
} from '@apps-next/core';
import { observable } from '@legendapp/state';
import { getCommandGroups } from '../commands/commands.get';
import { derviedDetailPage$ } from './legend.detailpage.derived';
import { hasRightSidebarFiltering } from './legend.rightsidebar.state';
import {
  currentView$,
  detailLabel$,
  detailUserView$,
  parentUserView$,
  parentView$,
  parentViewName$,
  tablename$,
  userView$,
  view$,
} from './legend.shared.derived';
import { store$ } from './legend.store';
import { getCommandsDropdownProps, viewActions } from './legend.utils.helper';
import { commands } from '../commands/commands';

export const pageHeaderProps$ = observable<Partial<MakePageHeaderPropsOption>>(
  {}
);

export const derivedPageHeaderProps$ = observable(() => {
  const detailProps = derviedDetailPage$.get();

  if (store$.detail.row.get()) {
    const allowedCommands: CommandName[] = [
      'model-commands',
      'model-attribute-commands',
    ];

    return {
      starred: detailUserView$.get()?.starred ?? false,
      icon: parentView$.get()?.icon,
      emoji: parentUserView$.get()?.emoji,
      viewName: parentViewName$.get() ?? '',
      detail: {
        label: detailLabel$.get() ?? '',
        onClickParentView: () => {
          store$.navigation.set({
            state: {
              view:
                parentUserView$.get()?.name ??
                parentView$.get()?.viewName ??
                '',
              slug:
                parentUserView$.get()?.slug ??
                parentView$.get()?.viewName ??
                '',
              id: undefined,
              type: 'navigate',
            },
          });
        },
        ...detailProps,
      },

      onToggleFavorite: async () => {
        viewActions().toggleFavorite();
      },

      commands: {},

      commandsDropdownProps: getCommandsDropdownProps({
        view: 'view',
        commands: getCommandGroups().map((g) => ({
          items: g.items
            .filter((i) => allowedCommands.includes(i.command))
            .filter((i) =>
              i.command !== 'model-attribute-commands'
                ? true
                : i.field?.showFieldActionInDetailCommands
            ),
          header: g.header,
        })),
      }),
    } satisfies PageHeaderProps;
  }

  const view = view$.get();
  if (!view) throw new Error('View is not defined');

  const primaryCommand = commands.makeOpenCreateFormCommand(view);

  const commandsGroupsForLustActions = getCommandGroups().filter((g) =>
    g.items.find(
      (i) => i.command === 'open-view-form' && i.tablename === tablename$.get()
    )
  );

  let commandsDropdownProps = getCommandsDropdownProps({
    view: 'list-actions',
    commands:
      commandsGroupsForLustActions.length === 1
        ? []
        : commandsGroupsForLustActions,
  });

  if (store$.list.selected.get()?.length) {
    commandsDropdownProps = getCommandsDropdownProps({
      view: 'detail-row',
      commands: getCommandGroups(),
    });
  }

  return {
    query: {
      onChange: (query) => {
        store$.viewQuery.set(query);
      },
      toggleShowInput: () => {
        store$.pageHeader.showSearchInput.set((prev) => !prev);
      },
      onBlur: () => {
        if (store$.viewQuery.get() === '') {
          store$.pageHeader.showSearchInput.set(false);
        }
      },
      onToggleRightSidebar: hasRightSidebarFiltering()
        ? () => {
            store$.rightSidebar.open.set((prev) => !prev);
          }
        : undefined,
      showInput: store$.pageHeader.showSearchInput.get(),
      query: store$.viewQuery.get(),
    },
    viewName:
      store$.userViewData.name.get() ??
      currentView$.viewName.get().firstUpper() ??
      '',
    icon: currentView$.get().icon,
    emoji: userView$.get()?.emoji,
    starred: store$.userViewData.starred.get() ?? false,

    commandsDropdownProps: getCommandsDropdownProps({
      view: 'view',
      commands: getCommandGroups().filter((g) =>
        g.items.find((i) => i.command === 'view-commands')
      ),
    }),

    commands: {
      primaryCommand: primaryCommand,
      commandsDropdownProps,
    },

    onToggleFavorite: async () => {
      viewActions().toggleFavorite();
    },
  } satisfies PageHeaderProps;
});
