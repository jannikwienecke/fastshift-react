import {
  MakePageHeaderPropsOption,
  PageHeaderProps,
  RecordType,
} from '@apps-next/core';

import {
  derivedPageHeaderProps$,
  pageHeaderProps$,
} from './legend.pageheader.derived';

export const makePageHeaderProps = <T extends RecordType>(
  options?: MakePageHeaderPropsOption<T>
): PageHeaderProps => {
  pageHeaderProps$.set(options ?? {});

  const state = derivedPageHeaderProps$.get();

  return state;
};
