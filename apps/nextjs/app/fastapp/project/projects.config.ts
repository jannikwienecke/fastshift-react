import { createViewConfig } from '@apps-next/react';
import { PrismaClientType } from '../../../db';
import { globalConfig } from '../../global-config';
import { configurePrismaLoader } from '@apps-next/prisma-adapter';

const _viewConfig = createViewConfig(
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
