import {
  DetailPageProps,
  FormFieldProps,
  getFieldLabel,
} from '@apps-next/core';
import { CubeIcon, DotsHorizontalIcon } from '@radix-ui/react-icons';
import {
  Layers3Icon,
  ChevronRightIcon,
  StarIcon,
  ShareIcon,
} from 'lucide-react';
import { Checkbox } from '../components/checkbox';
import { Button } from '../components';

const DetailPageHeader = (props: DetailPageProps) => {
  return (
    <>
      <div
        data-testid="detail-page-header"
        className="border-y-[.5px] pl-8 py-3 text-sm flex flex-row gap-4 items-center"
      >
        <div className="flex flex-row items-center">
          <Layers3Icon className="h-4" />
          <ChevronRightIcon className="h-3" />
          <div>{props.viewName}</div>
          <ChevronRightIcon className="h-3" />
          <div>{props.row.label}</div>
        </div>
        <DotsHorizontalIcon />
        <StarIcon className="h-4" />

        <div className="flex flex-row gap-2">
          <Button
            onClick={() => props.onSelectView({ type: 'overview' })}
            variant={
              props.viewTypeState.type === 'overview' ? 'outline' : 'ghost'
            }
            className=""
            size="sm"
          >
            Overview
          </Button>

          {props.relationalListFields.map((field) => {
            const model =
              props.viewTypeState.type === 'model'
                ? props.viewTypeState.model
                : '';
            const isActive = model === field.field?.name;
            if (!field.field) return null;
            return (
              <Button
                onMouseOver={() => {
                  props.onHoverRelationalListField(field);
                }}
                key={`relational-list-field-${field.field.name}`}
                onClick={() =>
                  props.onSelectView({
                    model: field.field?.name ?? '',
                    type: 'model',
                  })
                }
                variant={isActive ? 'outline' : 'ghost'}
                className=""
                size="sm"
              >
                {getFieldLabel(field.field)}
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
};

const DetailPageFormFields = (
  props: DetailPageProps & {
    FormField: React.FC<FormFieldProps>;
  }
) => {
  return (
    <>
      {props.displayField?.field ? (
        <props.FormField {...props} field={props.displayField} />
      ) : null}

      <div className="grid grid-cols-2 gap-x-6 w-full">
        {props.primitiveFields
          .filter((field) => field.field?.type !== 'Date')
          .map((field, index) => {
            return (
              <props.FormField
                key={`primitive-string-field-${field.field?.name}`}
                {...props}
                field={field}
              />
            );
          })}

        <div className="flex flex-row gap-4">
          {props.primitiveFields.map((field) => {
            if (field.field?.type === 'Boolean') {
              return (
                <div
                  key={`primitive-boolean-field-${field.field.name}`}
                  className="flex flex-row gap-2 items-center text-sm"
                >
                  <Checkbox
                    defaultChecked={field.field.defaultValue as boolean}
                    onCheckedChange={(checked) => {
                      props.onCheckedChange(field, Boolean(checked));
                    }}
                    className="h-4 w-4"
                  />
                  <div>{field.label}</div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </>
  );
};

const DetailPageIcon = (props: DetailPageProps) => {
  const Icon = props.icon ?? CubeIcon;
  return (
    <div className="p-2 bg-gray-100 w-12 grid place-items-center rounded-md">
      <Icon className="h-5 w-5 text-gray-600" />
    </div>
  );
};

const DetailPagePropertiesHeader = (props: DetailPageProps) => {
  return (
    <div className="py-3 text-sm flex flex-row justify-between items-center text-xs">
      <div className="text-foreground/70">Properties</div>

      <div className="flex flex-row gap-3 items-center">
        <ShareIcon className="h-4 w-4" />
        <StarIcon className="h-4 w-4" />
      </div>
    </div>
  );
};

const DetailPagePropertiesList = (
  props: DetailPageProps & {
    ComplexFormField: React.FC<FormFieldProps>;
  }
) => {
  return (
    <div className="flex flex-col gap-6 pt-8 text-sm">
      {props.complexFields.map((field) => {
        const fieldConfig = field.field;
        if (!fieldConfig) return null;

        return (
          <props.ComplexFormField
            key={`complex-field-${field.field?.name}`}
            {...props}
            field={field}
          />
        );
      })}
    </div>
  );
};

export const detailPage = {
  header: DetailPageHeader,
  formFields: DetailPageFormFields,
  icon: DetailPageIcon,
  propertiesHeader: DetailPagePropertiesHeader,
  propertiesList: DetailPagePropertiesList,
};
