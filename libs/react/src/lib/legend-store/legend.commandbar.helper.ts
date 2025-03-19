import {
  ComboxboxItem,
  CommandbarProps,
  CREATE_NEW_OPTION,
  getEditLabel,
  getFieldLabel,
  NONE_OPTION,
  Row,
  t,
  TranslationKeys,
} from '@apps-next/core';
import { getViewFieldsOptions } from './legend.combobox.helper';
import { store$ } from './legend.store';
import { comboboxStore$ } from './legend.store.derived.combobox';

export const getCommandbarDefaultListProps = () => {
  const viewConfigManager = store$.viewConfigManager.get();
  const viewName = viewConfigManager.getViewName();
  const rowInFocus = store$.list.rowInFocus.row.get();

  const viewgetViewFieldsOptions = getViewFieldsOptions({ useEditLabel: true });

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
              name: getFieldLabel(viewField, true),
            }),
          },
        ],
        all.slice(0, 10),
      ],
      groupLabels: ['New Project', 'Projects'],
    } satisfies PropsType;
  }

  throw new Error('Field type not supported');
};
