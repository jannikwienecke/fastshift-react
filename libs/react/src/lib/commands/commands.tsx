import {
  _log,
  ADD_NEW_OPTION,
  ComboxboxItem,
  CommandbarItem,
  DELETE_OPTION,
  FieldConfig,
  getFieldLabel,
  getViewLabel,
  makeRowFromValue,
  NONE_OPTION,
  Row,
  t,
  TranslationKeys,
  ViewConfigType,
} from '@apps-next/core';
import { Layers3Icon, PlusIcon } from 'lucide-react';
import { comboboxStore$, getView, parentView$, store$ } from '../legend-store';
import { xSelect } from '../legend-store/legend.select-state';
import {
  copyRow,
  getIsManyRelationView,
  getViewConfigManager,
  isDetail,
  isDetailOverview,
} from '../legend-store/legend.utils';
import { SELECT_FILTER_DATE } from '../ui-adapter/filter-adapter';
import {
  commandsHelper,
  getCommandsType,
  getParsedDateRowForMutation,
} from './commands.helper';
import { setCommandbarQuery } from '../legend-store/legend.commandbar.fn';
import { getComponent } from '../ui-components/ui-components.helper';

const getViewName = () => getViewConfigManager()?.getViewName();

const viewSaveCommand: CommandbarItem = {
  id: 'save-view',
  command: 'save-view',
  label: '__commands.saveView',
  header: 'view',
  getViewName,
  icon: Layers3Icon,
  getIsVisible: () => {
    return store$.userViewSettings.hasChanged.get();
  },
  handler: () => {
    _log.info('viewSaveCommand - handler');
    alert('HANDLE...viewSaveCommand NOT IMPLEMENTED');
  },
};

const makeSelectModelAttributeCommand = (
  item: ComboxboxItem
): CommandbarItem => {
  const field = getViewConfigManager().getFieldBy(item.id.toString());
  const icon =
    item.icon ||
    getComponent({
      fieldName: field.name,
      componentType: 'icon',
      isDetail: isDetail(),
    }) ||
    getView(field.name)?.icon;

  const command = {
    id: item.id,
    label: item.label,
    header: '',
    command: 'model-attribute-commands',
    getViewName,
    tablename: item.tablename,
    field,
    getIsVisible: () =>
      getCommandsType() !== 'detail-row' && getCommandsType() !== 'closed',
    icon,
    handler: ({ row: commandbarRow, value: command }) => {
      console.debug('makeSelectModelAttributeCommand called');

      const row = commandbarRow || store$.detail.row.get();
      const field = command?.field;

      if (!field) return;
      if (!commandbarRow) {
        store$.commandbarOpen(row as Row);
        store$.commandbar.selectedViewField.set(field);
        return;
      }

      const value = row?.getValue?.(field.name);
      let query = '';
      if (field.type === 'Boolean') {
        store$.updateRecordMutation({
          field,
          row: row as Row,
          valueRow: makeRowFromValue(!value, field),
        });
        store$.commandbarClose();
      } else if (field.relation) {
        xSelect.open(row as Row, field);
        store$.commandbar.selectedViewField.set(field);
      } else if (field.type === 'String') {
        query = value;
        store$.commandbar.selectedViewField.set(field);
      } else {
        store$.commandbar.selectedViewField.set(field);
      }

      setCommandbarQuery(store$, query);
    },
  } satisfies CommandbarItem;

  return command;
};

const makeSelectRelationalOptionCommand = (
  item: ComboxboxItem
): CommandbarItem => {
  const command = {
    ...item,
    id: item.id,
    label: item.label,
    header: '',
    command: 'select-model-relational-option',
    getViewName,
    getIsVisible: () => store$.commandsDisplay.type.get() === 'view',

    handler: ({ row, field, value }) => {
      if (!row || !field) return;
      _log.debug('makeSelectRelationalOptionCommand - handler');

      if (field.relation?.manyToManyTable) {
        if ((item as Row | undefined)?.raw) {
          xSelect.select(item as Row);
        } else {
          const row = comboboxStore$.values
            .find((v) => v.id.get() === item.id)
            ?.get();
          row && xSelect.select(row as Row);
        }
      } else {
        store$.updateRecordMutation({
          field,
          row: row as Row,
          valueRow: item as Row,
        });
        store$.commandbarClose();
      }
    },
  } satisfies CommandbarItem;

  return command;
};

const makeUpdateRecordAttributeCommand = (
  item: ComboxboxItem
): CommandbarItem => {
  return {
    ...item,
    header: '',
    command: 'update-model-attribute',
    getViewName,
    handler: (options) => {
      const { field, row } = options;
      if (!field || !row) return;

      console.debug('makeUpdateRecordAttributeCommand - handler', item);

      let value = makeRowFromValue(
        field.relation ? item.id.toString() : (item as Row)?.raw ?? item.label,
        field
      );

      if (item.id === SELECT_FILTER_DATE) {
        return commandsHelper.openCommandbarDatePicker(options);
      }

      if (field.type === 'String') {
        const query = store$.commandbar.query.get() ?? '';
        const error =
          field && store$.viewConfigManager.validateField(field, query);
        if (error) return;

        value = makeRowFromValue(query, field);
      }

      if (field.isDateField) {
        const parsedRow = getParsedDateRowForMutation(options);

        value = parsedRow ?? value;
      }

      store$.updateRecordMutation(
        {
          field,
          row: row as Row,
          valueRow: value,
        },
        () => _log.debug('makeUpdateRecordAttributeCommand - success'),
        () => commandsHelper.onError(options)
      );
      store$.commandbarClose();
    },
  };
};

const makeOpenCreateFormCommand = (view: ViewConfigType): CommandbarItem => {
  const label = getViewLabel(view, true);

  let labelToUse = t('common.createNew' satisfies TranslationKeys, {
    name: label,
  });

  const parentView = parentView$.get();

  if (
    isDetailOverview() &&
    parentView &&
    getIsManyRelationView(view.tableName)
  ) {
    const parentLabel = getViewLabel(parentView, true) as string;
    labelToUse = t('common.createNewIn' satisfies TranslationKeys, {
      name: label,
      field: parentLabel.toLowerCase(),
    });
  }

  return {
    id: ADD_NEW_OPTION,
    label: labelToUse,
    icon: PlusIcon,
    getIsVisible: () =>
      store$.commandsDisplay.type.get() === 'view' ||
      store$.commandsDisplay.type.get() === 'list-actions' ||
      store$.commandsDisplay.type.get() === 'commandbar',

    tablename: view.tableName,
    header: () => getViewLabel(view, true),
    command: 'open-view-form',
    getViewName,
    handler: () => {
      _log.debug('makeAddNewCommand - handler');
      store$.commandformOpen(view.viewName);
    },
  };
};

const makeRemoveAttributeCommand = (field: FieldConfig): CommandbarItem => {
  return {
    id: DELETE_OPTION,
    label: t('common.remove' satisfies TranslationKeys, {
      name: getFieldLabel(field),
    }),
    icon: PlusIcon,
    header: '',
    command: 'delete-model-attribute',
    getViewName,
    handler: ({ row }) => {
      _log.debug('makeRemoveAttributeCommand - handler');
      if (!field || !row) return;

      store$.updateRecordMutation({
        field: field,
        row: row as Row,
        valueRow: makeRowFromValue(NONE_OPTION, field),
      });
    },
  };
};

export const commands = {
  // viewCommand,
  viewSaveCommand,
  makeSelectModelAttributeCommand,
  makeSelectRelationalOptionCommand,
  makeUpdateRecordAttributeCommand,
  makeOpenCreateFormCommand,
  makeRemoveAttributeCommand,
};
