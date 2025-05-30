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
import { commandsHelper } from './commands.helper';
import { makeCopyCommands } from './commands.copy';
import { makeModelCommands } from './commands.model';
import { makeGoToCommands } from './commands.goTo';
import { makeOpenCommands } from './commands.open';

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
  const currentViewCommands = getCommandsForCurrentView();

  const userStoreCommands = commandsHelper.getUserStoreCommands();

  const openCreateModelFormCommands = getOpenCreateModelFormCommands();
  return [
    ...currentViewCommands,
    ...makeCopyCommands(),
    ...makeModelCommands(),
    ...makeOpenCommands(),
    ...makeGoToCommands(),
    commands.viewCommand,
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
      label: t(current.label as TranslationKeys),
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
