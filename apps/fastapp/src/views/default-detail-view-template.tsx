import { FormFieldProps, MakeDetailPropsOption } from '@apps-next/core';
import { makeHooks } from '@apps-next/react';
import { detailPage } from '@apps-next/ui';
import { observer } from '@legendapp/state/react';

export const DefaultDetailViewTemplate = observer(
  ({
    detailOptions,
    ...templateProps
  }: {
    detailOptions: MakeDetailPropsOption;
    formField: React.FC<FormFieldProps>;
    complexFormField: React.FC<FormFieldProps>;
  }) => {
    const { makeDetailPageProps } = makeHooks();
    const props = makeDetailPageProps(detailOptions);

    return (
      <div className="w-full py-2 flex flex-row">
        <div className="flex-grow border-r-[.5px] ">
          <detailPage.header {...props} />

          <div
            data-testid="detail-form"
            className="pt-12 flex flex-col gap-4 pl-20"
          >
            <detailPage.icon {...props} />

            <detailPage.formFields
              {...props}
              FormField={templateProps.formField}
            />
          </div>
        </div>

        <div className="w-96 border-t pl-8 pr-4 ">
          <detailPage.propertiesHeader {...props} />

          <detailPage.propertiesList
            {...props}
            ComplexFormField={templateProps.complexFormField}
          />
        </div>
      </div>
    );
  }
);
