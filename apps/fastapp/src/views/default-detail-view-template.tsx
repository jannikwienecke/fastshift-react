import { FormFieldProps, MakeDetailPropsOption } from '@apps-next/core';
import { makeHooks, RenderDetailComplexValue } from '@apps-next/react';
import { detailPage } from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import { Outlet } from '@tanstack/react-router';
import { RenderPageHeader, RenderPageHeaderDetail } from './default-components';

export const DefaultDetailViewTemplate = observer(
  ({
    detailOptions,
    ...templateProps
  }: {
    detailOptions: MakeDetailPropsOption;
    formField?: React.FC<FormFieldProps>;
    complexFormField?: React.FC<FormFieldProps>;
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
