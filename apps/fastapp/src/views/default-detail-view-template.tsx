import {
  FormFieldProps,
  MakeDetailPropsOption,
  HistoryType,
} from '@apps-next/core';
import {
  FormField,
  makeHooks,
  RenderActivityList,
  RenderDetailComplexValue,
  TabsFormField,
} from '@apps-next/react';
import { detailPage } from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import { Outlet } from '@tanstack/react-router';
import { RenderPageHeaderDetail } from './default-components';

export const DefaultDetailViewTemplate = observer(
  ({
    detailOptions,
    ...templateProps
  }: {
    detailOptions: MakeDetailPropsOption;
    formField?: React.FC<FormFieldProps>;
    complexFormField?: React.FC<FormFieldProps>;
    activityList?: React.FC<{ historyData: HistoryType[] }>;
  }) => {
    const { makeDetailPageProps } = makeHooks();
    const props = makeDetailPageProps(detailOptions);

    return (
      <div className="w-full">
        <div className="w-full py-2 flex flex-row h-screen">
          <div className="flex-grow border-r-[.5px] ">
            <div className="flex flex-row w-full justify-between border-gray-100 border-t-[1px] border-b-[1px] text-sm py-2 items-center">
              <div className="pl-8">
                <RenderPageHeaderDetail />
              </div>
            </div>

            <Outlet />
          </div>

          <div className="w-80 border-t pl-8 pr-4 ">
            <detailPage.propertiesHeader {...props} />

            <detailPage.propertiesList
              {...props}
              ComplexFormField={
                templateProps.complexFormField ?? RenderDetailComplexValue
              }
            />
          </div>
        </div>
      </div>
    );
  }
);

export const DefaultDetailOverviewTemplate = observer(
  ({
    detailOptions,
    ...templateProps
  }: {
    detailOptions?: MakeDetailPropsOption;
    activityList?: React.FC<{ historyData: HistoryType[] }>;
    FormField?: React.FC<FormFieldProps>;
  }) => {
    const { makeDetailPageProps } = makeHooks();

    const props = makeDetailPageProps(detailOptions);

    return (
      <>
        <div data-testid="detail-form" className="pt-12 flex flex-col gap-4">
          <div className="pl-20">
            <div className="pb-4">
              <detailPage.icon {...props} />
            </div>
            <detailPage.formFields
              {...props}
              FormField={templateProps.FormField ?? FormField}
            />
          </div>

          <div className="mt-12">
            <detailPage.tabs
              {...props}
              RenderActivityList={
                templateProps.activityList ?? RenderActivityList
              }
              FormField={TabsFormField}
              ComplexFormField={RenderDetailComplexValue}
            />
          </div>
        </div>
      </>
    );
  }
);
