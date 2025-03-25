import {
  ComboxboxItem,
  CommandbarProps,
  CREATE_NEW_OPTION,
  DELETE_OPTION,
  getEditLabel,
  getFieldLabel,
  NONE_OPTION,
  Row,
  t,
  TranslationKeys,
} from '@apps-next/core';
import Fuse from 'fuse.js';
import { getViewFieldsOptions } from './legend.combobox.helper';
import { store$ } from './legend.store';
import { comboboxStore$ } from './legend.store.derived.combobox';

export const getCommandbarDefaultListProps = () => {
  const viewConfigManager = store$.viewConfigManager.get();
  const viewName = viewConfigManager.getViewName();
  const rowInFocus = store$.list.rowInFocus.row.get() as Row | null;

  const viewgetViewFieldsOptions = getViewFieldsOptions({
    useEditLabel: true,
    row: rowInFocus,
  });

  const items: ComboxboxItem[] =
    viewgetViewFieldsOptions?.values?.map((item) => item) ?? [];

  return {
    headerLabel: `${viewName} - ${rowInFocus?.label ?? ''}`,
    inputPlaceholder: 'Type a command or search....',
    itemGroups: [items].map((group) => group),
  };
};

type PropsType = Partial<CommandbarProps>;
export const getCommandbarSelectedViewField = () => {
  const viewField = store$.commandbar.selectedViewField.get();

  if (!viewField) return {};

  if (viewField.type === 'String') {
    return {
      itemGroups: [
        [
          {
            id: viewField.name,
            label: getEditLabel(viewField),
          },
        ],
      ],
    } satisfies PropsType;
  } else if (viewField.type === 'Date') {
    const currentRow = store$.list.rowInFocus.row.get();
    const value = currentRow?.getValue?.(viewField.name);

    const options = comboboxStore$.values.get() ?? [];

    const commands = value
      ? [
          {
            id: DELETE_OPTION,
            label: t('common.remove' satisfies TranslationKeys, {
              name: getFieldLabel(viewField),
            }),
          },
        ]
      : [];

    return {
      itemGroups: [[...commands, ...options]],
    } satisfies PropsType;
  } else if (viewField.type === 'Enum') {
    return {
      inputPlaceholder: getEditLabel(viewField),
      itemGroups: [
        viewField.enum?.values.map((value) => ({
          id: value.name,
          label: value.name,
        })) ?? [],
      ],
    } satisfies PropsType;
  } else if (!viewField.relation?.manyToManyRelation) {
    const selectedOption = store$.list.rowInFocus.row.get();

    let relationalRow: Row | undefined = selectedOption?.getValue?.(
      viewField.name
    );

    relationalRow = (relationalRow as Row | undefined)?.id
      ? relationalRow
      : undefined;

    const combobox = comboboxStore$.get();

    const hasRelationalRowInValues = !!combobox.values?.find(
      (v) => v.id === relationalRow?.id
    );

    const all = hasRelationalRowInValues
      ? [...(combobox.values ?? [])]
      : [relationalRow as Row, ...(combobox.values ?? [])];

    all
      .sort((a, b) => {
        if (a.id === NONE_OPTION) return -1;
        if (b.id === NONE_OPTION) return 1;
        if (a.id === relationalRow?.id) return -1;
        if (b.id === relationalRow?.id) return 1;
        return 0;
      })
      .filter(Boolean);

    return {
      itemGroups: [
        [
          {
            id: CREATE_NEW_OPTION,
            label: t('common.createNew' satisfies TranslationKeys, {
              name: getFieldLabel(viewField),
            }),
          },
        ],
        all.slice(0, 10),
      ],
      groupLabels: ['New Project', 'Projects'],
    } satisfies PropsType;
  } else if (viewField.relation?.manyToManyRelation) {
    const selectedOption = store$.list.rowInFocus.row.get();

    const existingRows: Row[] | undefined = selectedOption?.getValue?.(
      viewField.name
    );

    const options = comboboxStore$.values.get();
    const optionsWithoutExistingRows =
      options?.filter(
        (option) => !existingRows?.some((row) => row.id === option.id)
      ) ?? [];

    // const existingRowsFiltered =
    const fuse = new Fuse(existingRows ?? [], {
      keys: ['label'],
      threshold: 0.3,
    });

    const query = store$.commandbar.query.get();
    const filteredExistingRows = query
      ? fuse.search(query).map((result) => result.item)
      : existingRows ?? [];

    const commands = [
      {
        id: CREATE_NEW_OPTION,
        label: t('common.createNew' satisfies TranslationKeys, {
          name: getFieldLabel(viewField, true),
        }),
      },
    ];

    const fuseCommands = new Fuse(commands, {
      keys: ['label'],
      threshold: 0.3,
    });

    const filteredCommands = query
      ? fuseCommands.search(query).map((result) => result.item)
      : commands;

    return {
      itemGroups: [
        filteredCommands,
        filteredExistingRows,
        optionsWithoutExistingRows,
      ],
      groupLabels: [
        filteredCommands.length ? 'New Tag' : '',
        filteredExistingRows.length ? 'Existing Tags' : '',
        optionsWithoutExistingRows.length ? 'Tags' : '',
      ].filter(Boolean),
    } satisfies PropsType;
  }

  throw new Error('Field type not supported');
};
