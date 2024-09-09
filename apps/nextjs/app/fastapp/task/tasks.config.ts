import { createViewConfig } from '@apps-next/core';

import { configurePrismaLoader } from '@apps-next/prisma-adapter';
import type { PrismaClientType } from '../../../db';
import { globalConfig } from '../../global-config';

export const viewConfig = configurePrismaLoader(
  createViewConfig(
    'task',
    {
      displayField: { field: 'name' },
      icon: 'FaTasks',
    },
    globalConfig.config
  )
)<PrismaClientType>({
  include: {
    tags: {
      include: { tag: true },
    },
  },
});
