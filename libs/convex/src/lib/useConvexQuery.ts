// import { QueryProps } from '@apps-next/core';

// import { convexQuery } from '@convex-dev/react-query';
// import { useQuery as useQueryTanstack } from '@tanstack/react-query';
// import { useRef } from 'react';

// // export type ViewLoader = FunctionReference<
// //   'query',
// //   'public',
// //   DefaultFunctionArgs,
// //   ConvexRecordType[] | null
// // >;
// export type ViewLoader = any;

// export const useStableQuery = (fn: ViewLoader, args: QueryProps) => {
//   const result = useQueryTanstack(convexQuery(fn, args));

//   const stored = useRef(result);

//   if (result.data !== undefined) {
//     stored.current = result;
//   }

//   return stored.current;
// };
