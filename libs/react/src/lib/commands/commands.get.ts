import {
  CommandbarItem,
  CommandbarProps,
  Row,
  t,
  TranslationKeys,
} from '@apps-next/core';
import { getViewConfigManager, store$ } from '../legend-store';
import { getViewFieldsOptions } from '../legend-store/legend.combobox.helper';
import { commands } from './commands';
import { makeCopyCommands } from './commands.copy';
import { makeGlobalQueryCommands } from './commands.globalQuery';
import { makeGoToCommands } from './commands.goTo';
import { commandsHelper } from './commands.helper';
import { makeModelCommands } from './commands.model';
import { makeOpenCommands } from './commands.open';
import { userStoreCommands$ } from './commands.user-commands';
import { makeViewCommands } from './commands.view';

export const getOpenCreateModelFormCommands = () => {
  const views = store$.views.get();

  const viewsToUse = Object.values(views).filter((view) => {
    if (!view) return false;
    // if (view?.viewName === currentView) return false;
    if (commandsHelper.isInternalView(view?.viewName)) return false;

    const numViewFields = Object.values(view?.viewFields ?? {}).length;
    const numRelationalIdFields = Object.values(view?.viewFields ?? {}).reduce(
      (prev, current) => {
        return current.type === 'OneToOneReference' ? prev + 1 : prev;
      },
      0
    );

    // we dont want to have manyToMany relations in the command bar
    if (numViewFields < 4 && numRelationalIdFields > 1) return false;

    return true;
  });

  const currentTableName = getViewConfigManager()?.getTableName();
  return viewsToUse
    .filter(Boolean)
    .map((view) => {
      if (!view) return null;
      const newCommand = commands.makeOpenCreateFormCommand(view);

      const command = {
        ...newCommand,
      } satisfies CommandbarItem;

      return command;
    })
    .filter((v) => v !== null)
    .sort((a, b) => {
      const aIsCurrent = a.tablename === currentTableName;
      const bIsCurrent = b.tablename === currentTableName;

      if (aIsCurrent && !bIsCurrent) return -1;
      if (!aIsCurrent && bIsCurrent) return 1;

      return 0;
    });
};

const getCommandsForCurrentView = (): CommandbarItem[] => {
  const row = store$.commandbar.activeRow.get() as Row | undefined;

  const viewgetViewFieldsOptions = getViewFieldsOptions({
    useEditLabel: true,
    row: row,
  });

  return (
    viewgetViewFieldsOptions?.values?.map((item) =>
      commands.makeSelectModelAttributeCommand(item)
    ) ?? []
  );
};

export const getCommandsList = (): CommandbarItem[] => {
  if (store$.commandbar.selectedViewField.get()) {
    // if a view field is selected, we only show the commands for that field
    return [];
  }

  const currentViewCommands = getCommandsForCurrentView();

  const userStoreCommands = userStoreCommands$.get();

  const openCreateModelFormCommands = getOpenCreateModelFormCommands();
  return [
    ...currentViewCommands,
    ...makeCopyCommands(),
    ...makeModelCommands(),
    ...makeViewCommands(),
    ...makeOpenCommands(),
    ...makeGoToCommands(),
    ...makeGlobalQueryCommands(),
    commands.viewSaveCommand,
    ...openCreateModelFormCommands,
    ...userStoreCommands,
  ].filter((c) => !c.getIsVisible || c.getIsVisible?.());
};

export const getAllCommandGroups = () => {
  const groups = getCommandsList().reduce((prev, current) => {
    const _current = {
      ...current,
      viewName: current.getViewName?.(),
      label: current.getLabel?.() || t(current.label as TranslationKeys),
      subCommands: current.subCommands?.map((c) => ({
        ...c,
        label: c.getLabel?.() || t(c.label as TranslationKeys),
      })),
    } satisfies CommandbarProps['groups'][number]['items'][0];

    const headerLabel =
      typeof current.header === 'function'
        ? current.header()
        : current.header
        ? t(`__commands.headers.${current.header}` satisfies TranslationKeys)
        : '';

    const group = prev.find((g) => g.header === headerLabel);
    if (group) {
      group.items.push(_current);
      group.items.sort((a, b) => {
        // by the command type
        if (a.command === b.command) {
          return 0; // same command type, keep original order
        }
        // by local compare
        return a.command.localeCompare(b.command);
      });
      group.items.sort((a, b) => {
        // sort by priority -> higher priority first
        // if no priority -> set to 0
        a.priority = a.priority ?? 0;
        b.priority = b.priority ?? 0;

        // if is primary command, set priority to 99999
        if (a.primaryCommand) {
          a.priority = 99999;
        }
        if (b.primaryCommand) {
          b.priority = 99999;
        }

        if (a.priority === b.priority) {
          return a.label.localeCompare(b.label);
        }
        if (a.priority && b.priority) {
          return (b.priority ?? 0) - (a.priority ?? 0);
        }
        if (a.priority) {
          return -1; // a has priority, b does not
        }
        if (b.priority) {
          return 1; // b has priority, a does not
        }
        // both have no priority
        // this is the case when both commands have no priority
        // if no priority, keep original order
        return 0;
        // return
      });
    } else {
      prev.push({
        header: headerLabel,
        items: [_current],
      });
    }

    return [...prev];
  }, [] as CommandbarProps['groups']);

  return groups;
};

export const getCommandGroups = () => {
  const viewField = store$.commandbar.selectedViewField.get();

  const allCommandGroups = getAllCommandGroups();

  if (viewField) {
    return [];
  }

  return commandsHelper.filterCommandGroups(allCommandGroups);
};

export const getPrimaryCommand = () => {
  const primaryCommand = userStoreCommands$.get().find((x) => x.primaryCommand);
  if (primaryCommand?.getIsVisible?.() === false) return undefined;

  return primaryCommand;
};
