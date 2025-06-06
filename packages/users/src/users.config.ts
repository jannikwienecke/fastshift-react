import { _createViewConfig } from '@apps-next/react';
import { PersonIcon } from '@radix-ui/react-icons';

export const usersConfig = _createViewConfig('users', {
  icon: PersonIcon,
  displayField: { field: 'email' },
});
