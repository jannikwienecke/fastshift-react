import { projectsConfig } from '@apps-next/convex';
import { DataType } from '@apps-next/core';
import { observer } from '@legendapp/state/react';
import { viewStore } from '../application-store/app.store';
import { DefaultViewTemplate } from './default-view-template';
import { makeViewFieldsConfig } from '@apps-next/react';

export type ProjectsViewDataType = DataType<
  'projects',
  {
    // projects: Projects;
  }
>;

// const uiViewConfig = makeViewFieldsConfig<ProjectsViewDataType>('projects', {
//   fields: {
//     description: {
//       component: {
//         list: (props) => {
//           return (
//             <span className="text-xs text-foreground/70">
//               {props.data.description}
//             </span>
//           );
//         },
//       },
//     },
//   },
// });

const ProjectsMainPage = observer(() => {
  return (
    <DefaultViewTemplate<ProjectsViewDataType>
      listOptions={{
        fieldsLeft: ['label', 'description'],
        fieldsRight: [],
      }}
    />
  );
});

viewStore.addView(projectsConfig).addComponents({ main: ProjectsMainPage });
// .addUiConfig(uiViewConfig);
