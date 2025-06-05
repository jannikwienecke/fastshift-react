import { _createViewConfig } from '@apps-next/react';
import { PersonIcon } from '@radix-ui/react-icons';
import { CheckCheckIcon, TagIcon } from 'lucide-react';

export const tagsConfig = _createViewConfig('tags', {
  icon: TagIcon,
  displayField: { field: 'name' },
  colorField: { field: 'color' },
});

export const tasksTagsConfig = _createViewConfig('tasks_tags', {
  icon: TagIcon,
  displayField: { field: 'tagId' },
  isManyToMany: true,
});

export const ownerConfig = _createViewConfig('owner', {
  icon: PersonIcon,
  displayField: { field: 'name' },
  fields: {
    history: {
      hide: true,
    },
    name: {
      hideFromForm: true,
    },
  },
  // onInsert
  mutation: {
    beforeInsert: (data) => {
      return {
        ...data,
        name: data.firstname + ' ' + data.lastname,
      };
      // FIXME -> also need to apply to update functions
    },
    beforeUpdate: (data, newData) => {
      const newRecord = { ...data, ...newData };
      return {
        ...newRecord,
        name: newRecord.firstname + ' ' + newRecord.lastname,
      };
    },
  },
});

export const todosConfig = _createViewConfig('todos', {
  icon: CheckCheckIcon,
  displayField: { field: 'name' },
});
