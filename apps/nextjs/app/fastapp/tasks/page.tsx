import { QueryPrefetchProvider } from '@apps-next/query-adapter';
import { viewLoader } from './actions';
import { TasksClient } from './tasks-client';

//   type PrismaFieldTypeMapping = {
//     [key in PrismaField['kind']]: FieldType;
//   };

//   const fieldTypeMapping: PrismaFieldTypeMapping = {
//     string: 'String',
//   };

//   const viewFields = models.reduce((acc, model) => {

//     return model.fields.reduce((acc, field) => {
//       console.log(field);
//       return {
//         ...acc,
//         [field.name]: {
//           type: fieldTypeMapping[field.kind] ?? 'String',
//           name: field.name,
//         },
//       };
//     }, acc);
//   }, {} as ViewFieldConfig);

export default async function FastAppTasksPage() {
  return (
    <QueryPrefetchProvider viewLoader={viewLoader} viewName={'post'}>
      <TasksClient />
    </QueryPrefetchProvider>
  );
}
