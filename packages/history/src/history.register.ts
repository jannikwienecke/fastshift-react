import { RegisteredViews, ViewConfigType, ViewRegistry } from '@apps-next/core';
import {
  HistoryDetailPage,
  HistoryMainPage,
  HistoryOverviewPage,
  uiViewConfig,
} from './history.view';

export const register = (
  views: RegisteredViews,
  viewRegistry: ViewRegistry
) => {
  const config = views['history'] as ViewConfigType<'history'>;
  viewRegistry
    .addView(config)
    .addComponents({
      main: HistoryMainPage,
      detail: HistoryDetailPage,
      overView: HistoryOverviewPage,
    })
    .addUiConfig(uiViewConfig);
};
