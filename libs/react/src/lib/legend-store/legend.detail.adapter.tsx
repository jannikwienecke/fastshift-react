import {
  DetailPageProps,
  MakeDetailPropsOption,
  RecordType,
} from '@apps-next/core';

import {
  derviedDetailPage$,
  detailPageProps$,
} from './legend.detailpage.derived';

export const makeDetailPageProps = <T extends RecordType>(
  options?: MakeDetailPropsOption<T>
): DetailPageProps => {
  detailPageProps$.set(options ?? {});

  const state = derviedDetailPage$.get();

  return {
    ...state,
  };
};
