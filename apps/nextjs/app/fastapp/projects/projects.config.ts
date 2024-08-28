import { createServerViewConfig } from '@apps-next/core';
import { globalConfig } from '../../layout';

export const viewConfig = createServerViewConfig(
  'project',
  {
    displayField: { field: 'label' },
    icon: 'FaProjectDiagram',
  },
  globalConfig.config
);
