import Fuse from 'fuse.js';

export const _filter = <T extends Array<any>>(
  items: T,
  keys: (keyof T[0])[]
) => {
  const fuseCommands = new Fuse(items, {
    keys: keys as string[],
    threshold: 0.3,
    distance: 100,
  });

  return {
    withQuery: (query?: string | null | undefined) => {
      if (!query) return items as T;
      return fuseCommands.search(query).map((result) => result.item) as T;
    },
  };
};
