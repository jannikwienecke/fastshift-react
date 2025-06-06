import {
  MakeRightSidebarOption,
  RecordType,
  RightSidebarProps,
} from '@apps-next/core';

import { rightSidebarProps$ } from './legend.rightsidebar.derived';

export const makeRightSidebarProps = <T extends RecordType>(
  options?: MakeRightSidebarOption<T>
): RightSidebarProps => {
  //   pageHeaderProps$.set(options ?? {});

  const state = rightSidebarProps$.get();

  return state;
};
