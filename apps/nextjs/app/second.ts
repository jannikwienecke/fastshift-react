export type RegisteredRouter = Register extends { config: infer T } ? T : never;

// export const loader = <
//   T extends keyof RegisteredRouter['config']['dataModel']['tables']
// >(
//   modelName: T,

//   fieldConfig: Partial<
//     Record<
//       keyof RegisteredRouter['config']['dataModel']['tables'][T]['validator']['fields'],
//       {
//         label: string;
//       }
//     >
//   >
// ) => {
//   type DataType = Infer<
//     RegisteredRouter['config']['dataModel']['tables'][T]['validator']
//   >;

//   type DataTypeWithId = DataType & { id: string };

//   return {
//     data: [] as DataTypeWithId[],
//   };
// };
