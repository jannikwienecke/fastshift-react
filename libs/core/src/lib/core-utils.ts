import { QUERY_KEY_PREFIX } from './types';

export const invarant = (condition: boolean, message: string) => {
  const prefix = 'Invariant failed';

  if (condition) {
    return;
  }

  const label = message ? `${prefix}: ${message}` : prefix;
  throw new Error(label);
};

export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const makeQueryKey = ({
  viewName,
  query,
  relation,
}: {
  viewName: string | undefined;
  query?: string | undefined;
  relation?: string | undefined;
}) => {
  return [
    QUERY_KEY_PREFIX,
    viewName,
    query ?? '',
    relation ? '_relational_' + relation : '',
  ];
};
