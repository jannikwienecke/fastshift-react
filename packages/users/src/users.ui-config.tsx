import { makeViewFieldsConfig } from '@apps-next/react';
import { EnvelopeClosedIcon } from '@radix-ui/react-icons';
import { UsersDataType } from './users.types';

export const usersUiViewConfig = makeViewFieldsConfig<UsersDataType>('users', {
  onDelete: {
    showConfirmation: true,
  },
  fields: {
    email: {
      component: {
        icon: EnvelopeClosedIcon,
      },
    },
  },
});
