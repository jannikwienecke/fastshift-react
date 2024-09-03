import { createServerViewConfig } from '@apps-next/core';
import { globalConfig } from '../../global-config';

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
  //TODO CHECK: DO I NEED TO PASS THIS IN??
  globalConfig.config
);
