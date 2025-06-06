import { RegisteredViews, ViewConfigType, ViewRegistry } from '@apps-next/core';
import { usersUiViewConfig } from './users.ui-config';

export const register = (
  views: RegisteredViews,
  viewRegistry: ViewRegistry
) => {
  const config = views['users'] as ViewConfigType<'users'>;
  viewRegistry.addView(config).addUiConfig(usersUiViewConfig);
};
