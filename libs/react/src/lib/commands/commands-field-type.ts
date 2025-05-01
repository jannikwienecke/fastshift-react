import {
  CommandbarItem,
  CommandbarProps,
  CREATE_NEW_OPTION,
  FieldConfig,
  getEditLabel,
  getFieldLabel,
  makeRowFromValue,
  NONE_OPTION,
  Row,
  TranslationKeys,
} from '@apps-next/core';
import { t } from 'i18next';
import { comboboxStore$, store$ } from '../legend-store';
import { commands } from './commands';
import { commandsHelper } from './commands.helper';

type PropsType = Partial<CommandbarProps>;

export const getCommandbarPropsForFieldType = (): PropsType | null => {
  const viewFieldOrUndefined = store$.commandbar.selectedViewField.get();
  if (!viewFieldOrUndefined) return null;

  const currentRow = store$.commandbar.activeRow.get();
  const query = store$.commandbar.query.get();
  const viewField = viewFieldOrUndefined as FieldConfig;

  const stringType = () => {
    const error =
      viewField && store$.viewConfigManager.validateField(viewField, query);

    return {
      inputPlaceholder: getEditLabel(viewField),
      error: {
        showError: !!error,
        message: error ? `Error: ${error}` : '',
      },
      groups: [
        {
          header: '',
          items: [
            commands.makeUpdateRecordAttributeCommand({
              id: viewField.name,
              label: getEditLabel(viewField),
            }),
          ],
        },
      ],
    } satisfies PropsType;
  };

  const dateType = () => {
    const value = currentRow?.getValue?.(viewField.name);

    const options = comboboxStore$.values.get() ?? [];

    const optionsCommands: CommandbarItem[] = options.map(
      commands.makeUpdateRecordAttributeCommand
    );

    const deleteCommand: CommandbarItem[] = value
      ? [commands.makeRemoveAttributeCommand(viewField)]
      : [];

    return {
      groups: [
        {
          header: '',
          items: [...deleteCommand, ...optionsCommands],
        },
      ],
    } satisfies PropsType;
  };

  const enumType = () => {
    return {
      inputPlaceholder: t('common.changeFieldTo', {
        field: getFieldLabel(viewField),
      }),
      groups: [
        {
          header: '',
          items:
            viewField.enum?.values.map((v) =>
              commands.makeUpdateRecordAttributeCommand(
                makeRowFromValue(v.name, viewField)
              )
            ) ?? [],
        },
      ],
    } satisfies PropsType;
  };

  const nonManyToManyType = () => {
    let relationalRow: Row | undefined = currentRow?.getValue?.(viewField.name);

    relationalRow = (relationalRow as Row | undefined)?.id
      ? relationalRow
      : undefined;

    const combobox = comboboxStore$.get();
    const hasRelationalRowInValues = !!combobox.values?.find(
      (v) => v.id === relationalRow?.id
    );

    const all =
      relationalRow && !hasRelationalRowInValues
        ? [relationalRow, ...(combobox.values ?? [])]
        : [...(combobox.values ?? [])];

    all
      .sort((a, b) => {
        if (a.id === NONE_OPTION) return -1;
        if (b.id === NONE_OPTION) return 1;
        if (a.id === relationalRow?.id) return -1;
        if (b.id === relationalRow?.id) return 1;
        return 0;
      })
      .filter(Boolean)
      .filter((f) => f.id);

    const allCommands = all.map(commands.makeSelectRelationalOptionCommand);

    const view = store$.viewConfigManager.getViewByFieldName(
      viewField.name,
      store$.views.get()
    );
    const createNewCommand = view
      ? [commands.makeOpenCreateFormCommand(view)]
      : [];

    return {
      inputPlaceholder: t('common.changeFieldTo', {
        field: getFieldLabel(viewField),
      }),
      groups: [
        {
          header: '',
          items: [...createNewCommand, ...allCommands.slice(0, 10)],
        },
      ],
    } satisfies PropsType;
  };

  const manyToManyType = () => {
    const { values, defaultSelected } = comboboxStore$.get() ?? {};

    const filteredExistingRows =
      defaultSelected?.map((row) => ({
        id: row.id,
        label: row.label,
      })) ?? [];

    const optionsWithoutExistingRows =
      values
        ?.filter((row) => {
          return !defaultSelected?.some((r) => r.id === row.id);
        })
        .map((row) => ({
          id: row.id,
          label: row.label,
        })) ?? [];

    const createNewCommand = [
      {
        id: CREATE_NEW_OPTION,
        label: t('common.createNew' satisfies TranslationKeys, {
          name: getFieldLabel(viewField, true),
        }),
      },
    ];

    const groups = [
      createNewCommand,
      filteredExistingRows,
      optionsWithoutExistingRows,
    ]
      .flatMap((g) => g)
      .filter(Boolean)
      .map((g) => commands.makeSelectRelationalOptionCommand(g));

    return {
      inputPlaceholder: t('common.changeOrAdd', {
        field: getFieldLabel(viewField),
      }),
      groups: [
        {
          header: '',
          items: groups,
        },
      ],
    } satisfies PropsType;
  };

  const handle = () => {
    if (viewField.type === 'String') {
      return stringType();
    }

    if (viewField.type === 'Date') {
      return dateType();
    }

    if (viewField.type === 'Enum') {
      return enumType();
    }

    if (!viewField.relation?.manyToManyTable) {
      return nonManyToManyType();
    }

    if (viewField.relation?.manyToManyTable) {
      return manyToManyType();
    }

    return null;
  };

  const props = handle();

  if (!props) {
    throw new Error(
      `getCommandbarPropsForFieldType - field type not supported: ${viewField.type}`
    );
  }

  return {
    ...props,
    groups:
      viewField.type === 'String'
        ? props.groups
        : commandsHelper.filterCommandGroups(props.groups),
  };
};
