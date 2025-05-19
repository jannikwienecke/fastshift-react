import { observable } from '@legendapp/state';

export const perstistedStore$ = observable<{
  activeTabFieldName?: string;
  isActivityTab?: boolean;
}>({
  isActivityTab: true,
});
