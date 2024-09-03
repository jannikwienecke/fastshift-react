import { createServerViewConfig } from '@apps-next/core';
import { globalConfig } from '../../layout';
import { configurePrismaLoader } from '@apps-next/query-adapter';
import { PrismaClientType } from '../../../db';

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
