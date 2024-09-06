// 'use client';

// import {
//   dehydrate,
//   HydrationBoundary,
//   QueryClient,
// } from '@tanstack/react-query';

// export const ClientProvider = ({
//   children,
//   queryClient,
// }: {
//   children: React.ReactNode;
//   queryClient: QueryClient;
// }) => {
//   return (
//     <>
//       <HydrationBoundary state={dehydrate(queryClient)}>
//         {children}
//       </HydrationBoundary>
//     </>
//   );
// };
