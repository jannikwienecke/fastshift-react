/* eslint-disable @typescript-eslint/no-explicit-any */

import { REGISTRED_VIEWS } from './create-view-config';
import { ViewConfigType } from './types';

export const registerViewHandler = {
  register(viewName: string, viewConfig: ViewConfigType) {
    REGISTRED_VIEWS[viewName as any] = viewConfig;
  },

  get(viewName: string): ViewConfigType {
    const view = REGISTRED_VIEWS[viewName as any];

    if (!view) {
      throw new Error(`registerViewHandler: view not found for ${viewName}`);
    }

    return view;
  },

  _getAll() {
    return REGISTRED_VIEWS;
  },
};
