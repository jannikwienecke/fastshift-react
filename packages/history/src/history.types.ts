import { HistoryType } from '@apps-next/core';
import { IHistory, IOwner } from '@apps-next/shared';

export type HistoryViewDataType = HistoryType & IHistory & { owner: IOwner };
