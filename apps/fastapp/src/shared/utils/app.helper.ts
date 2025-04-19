import { views } from '@apps-next/convex';
import { getViewByName, slugHelper } from '@apps-next/core';

export const getViewParms = (params: { id?: string; view: string }) => {
  const hasView = getViewByName(views, params.view);

  if (hasView) {
    return { id: params.id, viewName: params.view, slug: params.view };
  }

  const slug = params.view;
  const viewName = slugHelper().unslugify(slug);

  return { id: params.id, viewName, slug };
};
