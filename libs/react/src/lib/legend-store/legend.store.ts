import { observable } from '@legendapp/state';
import { DEFAULT_LEGEND_STORE } from './legend.store.constants';
import { LegendStore } from './legend.store.types';

import {
  createDataModel,
  createRelationalDataModel,
  init,
} from './legend.store.fn.global';
import { listSelect } from './legend.store.fn.list';

export const store$ = observable<LegendStore>({
  ...DEFAULT_LEGEND_STORE,

  init: (...props) => init(store$)(...props),
  createDataModel: (...props) => createDataModel(store$)(...props),
  createRelationalDataModel: (...props) =>
    createRelationalDataModel(store$)(...props),
  //   list methods
  selectListItem: (...props) => listSelect(store$)(...props),
});
