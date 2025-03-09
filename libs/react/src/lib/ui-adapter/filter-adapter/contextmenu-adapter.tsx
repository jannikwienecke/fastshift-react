import {
  ContextMenuUiOptions,
  MakeContextMenuPropsOptions,
  RecordType,
} from '@apps-next/core';
import {
  contextMenuProps,
  derviedContextMenuOptions,
} from '../../legend-store/legend.contextmenu.derived';

export const makeContextMenuProps = <T extends RecordType>(
  options?: MakeContextMenuPropsOptions<T>
): ContextMenuUiOptions => {
  contextMenuProps.set(options ?? {});

  return derviedContextMenuOptions.get();
};
