import { createServerViewConfig } from '@apps-next/core';
import { globalConfig } from '../../layout';

export const viewConfig = createServerViewConfig(
  'category',
  {
    displayField: { field: 'label' },
    icon: 'FaLayerGroup',
    iconColor: '#4299e1',
    ui: {
      list: {
        showIcon: true,

        fieldsLeft: ['label'],
        fieldsRight: ['color'],
      },
    },
  },
  globalConfig.config
);
