import { Users, usersConfig } from '@apps-next/convex';
import { makeViewFieldsConfig, viewRegistry } from '@apps-next/react';
import { EnvelopeClosedIcon } from '@radix-ui/react-icons';

export const usersUiViewConfig = makeViewFieldsConfig<Users>('users', {
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

viewRegistry.addView(usersConfig).addUiConfig(usersUiViewConfig);
