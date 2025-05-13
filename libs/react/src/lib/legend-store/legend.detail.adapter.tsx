import {
  DetailPageProps,
  MakeDetailPropsOption,
  RecordType,
} from '@apps-next/core';

import {
  derviedDetailPage$,
  detailPageProps$,
} from './legend.detailpage.derived';
import { store$ } from './legend.store';

export const makeDetailPageProps = <T extends RecordType>(
  options?: MakeDetailPropsOption<T>
): DetailPageProps => {
  if (options) {
    detailPageProps$.set((prev) => ({
      ...prev,
      ...options,
    }));
  }

  if (options?.onClickRelation) {
    store$.detail.onClickRelation.set({
      fn: options.onClickRelation,
    });
  }

  const state = derviedDetailPage$.get();

  return {
    ...state,
  };
};
