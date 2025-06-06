import { DefaultViewTemplate } from '@apps-next/shared';
import { observer } from '@legendapp/state/react';
import { ProjectViewDataType } from './projects.types';

export const ProjectsMainPage = observer(() => {
  return (
    <DefaultViewTemplate<ProjectViewDataType>
      listOptions={{
        fieldsLeft: ['label', 'description'],
        fieldsRight: ['categories', 'tasks'],
      }}
    />
  );
});
