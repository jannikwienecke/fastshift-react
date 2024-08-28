import { createServerViewConfig } from '@apps-next/core';
import { globalConfig } from '../../layout';

export const viewConfig = createServerViewConfig(
  'task',
  {
    displayField: { field: 'name' },
    icon: 'FaTasks',
  },
  globalConfig.config
);
