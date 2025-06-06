import { _createViewConfig } from '@apps-next/react';
import { TokensIcon } from '@radix-ui/react-icons';

export const projectsConfig = _createViewConfig('projects', {
  icon: TokensIcon,
  includeFields: ['tasks'],
  displayField: {
    field: 'label',
  },

  fields: {
    tasks: { includeInRelationalDataQuery: true },
    categoryId: {
      useAsSidebarFilter: true,
    },
    ownerId: {
      useAsSidebarFilter: true,
      showFieldActionInDetailCommands: true,
    },
    dueDate: {
      isDateField: true,
      showFieldActionInDetailCommands: true,
      dateFormatter: (date) =>
        date.toLocaleDateString('de-DE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
    },
  },
  query: {
    showDeleted: false,
  },
  mutation: {
    softDelete: true,
    softDeleteField: 'deleted_',
  },
  ui: {
    showComboboxOnClickRelation: true,
  },
});
