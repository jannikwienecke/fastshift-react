import { createServerViewConfig } from '@apps-next/core';
import { configurePrismaLoader } from '@apps-next/query-adapter';
import { PrismaClientType } from '../../../db';
import { globalConfig } from '../../global-config';

const _viewConfig = createServerViewConfig(
  'project',
  {
    displayField: { field: 'label' },
    icon: 'FaProjectDiagram',
  },
  globalConfig.config
);

export const viewConfig = configurePrismaLoader(_viewConfig)<PrismaClientType>({
  include: {
    tasks: true,
  },
});
