import { views } from '@apps-next/convex';
import {
  FieldConfig,
  getViewByName,
  patchDict,
  RecordType,
  renderModelName,
  slugHelper,
  t,
} from '@apps-next/core';
import { getUserViews } from '../../query-client';
import { getViewData } from '../../application-store/app.store.utils';
import { store$ } from '@apps-next/react';

export const getViewParms = (params: {
  id?: string;
  view?: string;
  model?: string;
}) => {
  if (!params?.view) {
    return {
      id: params.id,
      viewName: undefined,
      slug: undefined,
      model: undefined,
    };
  }

  const userViews = store$.userViews.get() ?? getUserViews();

  const userViewData = userViews?.find((v) => v.slug === params.view);

  const hasView = getViewByName(views, userViewData?.baseView ?? params?.view);

  const model = params.model;
  if (hasView) {
    return {
      id: params.id,
      viewName: userViewData?.name ?? hasView.viewName,
      slug: params.view,
      model,
    };
  }

  const slug = params.view;
  const viewName = slugHelper().unslugify(slug);

  return { id: params.id, viewName, slug, model };
};

export const pachTheViews = () => {
  return patchDict(views ?? {}, (view) => {
    if (!view) return view;
    return {
      ...view,
      viewFields: patchDict(view.viewFields, (f) => {
        // eslint-disable-next-line
        // @ts-ignore
        const userFieldConfig = view.fields?.[f.name];
        const displayField = view.displayField.field;
        const softDeleteField = view.mutation?.softDeleteField;

        const hideFieldFromForm = softDeleteField && softDeleteField === f.name;
        const isDisplayField =
          displayField && f.name === displayField ? true : undefined;

        return {
          ...f,
          ...userFieldConfig,
          isDisplayField,
          label: f.label || renderModelName(f.name, t),
          hideFromForm: hideFieldFromForm || userFieldConfig?.hideFromForm,
        } satisfies FieldConfig;
      }),
    };
  });
};

export const getView = (props: { params: RecordType }) => {
  if (!props.params) throw new Error('View name is required');

  const { viewName } = getViewParms(props.params);

  if (!viewName) throw new Error('View name is required');

  const { viewData, userViewData } = getViewData(viewName);
  return { viewData, userViewData, viewName };
};
