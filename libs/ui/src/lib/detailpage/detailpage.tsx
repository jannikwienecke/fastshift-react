import {
  DetailPageProps,
  FormFieldProps,
  getFieldLabel,
  HistoryType,
  useTranslation,
} from '@apps-next/core';
import { CubeIcon, DotsHorizontalIcon } from '@radix-ui/react-icons';
import {
  ActivityIcon,
  ChevronRightIcon,
  Layers3Icon,
  ShareIcon,
  StarIcon,
} from 'lucide-react';
import React from 'react';
import { Button } from '../components';
import { Checkbox } from '../components/checkbox';
import { EmojiPickerDialog } from '../emoji-picker-dialog';
import { cn } from '../utils';
import { BubbleItem } from '../standard-components';

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
    <EmojiPickerDialog
      onSelectEmoji={(emoji) => {
        props.onSelectEmoji(emoji);
      }}
    >
      <div className="p-2 bg-gray-100 w-12 grid place-items-center rounded-md">
        {props.emoji ? (
          props.emoji.emoji
        ) : (
          <Icon className="h-5 w-5 text-gray-600" />
        )}
      </div>
    </EmojiPickerDialog>
  );
};

const DetailPagePropertiesHeader = (props: DetailPageProps) => {
  return (
    <div className="py-3 flex flex-row justify-between items-center text-sm">
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
    <div
      className="flex flex-col gap-6 pt-8 text-sm"
      data-testid="detail-properties"
    >
      {props.propertyFields.map((field) => {
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

const DetailTabs = (
  props: DetailPageProps & {
    FormField: React.FC<FormFieldProps>;
    ComplexFormField: React.FC<FormFieldProps>;
    RenderActivityList: React.FC<{ historyData: HistoryType[] }>;
  }
) => {
  const { t } = useTranslation();
  if (!props.tabs) return null;

  const {
    activeTabComplexFields,
    activeTabField,
    activeTabPrimitiveFields,
    detailTabsFields,
    onSelectTab,
    onSelectHistoryTab,
  } = props.tabs;

  return (
    <div className="text-sm" data-testid="detail-tabs">
      <div className="flex flex-row gap-0">
        <div className="border-b-[.5px] w-20"></div>

        <button
          onClick={() => onSelectHistoryTab()}
          className={cn(
            'border-[.5px] py-2 px-4 flex flex-row gap-2 items-center',
            props.tabs.isHistoryTab
              ? ' border-b-0 text-foreground'
              : 'text-foreground/70'
          )}
        >
          {/* TODO Fix translation */}
          <ActivityIcon className="h-4 w-4" />
          {'Acitivty'}
        </button>

        {detailTabsFields.map((tab) => {
          const isActive =
            activeTabField?.field?.name === tab.field?.name &&
            props.tabs?.isHistoryTab !== true;

          return (
            <button
              key={tab.field?.name}
              onClick={() => onSelectTab(tab)}
              className={cn(
                'border-[.5px] py-2 px-4 flex flex-row gap-2 items-center',
                isActive ? ' border-b-0 text-foreground' : 'text-foreground/70'
              )}
            >
              {tab.icon ? <tab.icon className="h-4 w-4" /> : null}
              <div>{tab.field?.label}</div>
            </button>
          );
        })}

        <div className="flex-grow border-b-[.5px]" />
      </div>

      {props.tabs.isHistoryTab ? (
        <div className="pl-24 pt-8 text-sm flex flex-col">
          <props.RenderActivityList historyData={props.tabs.historyData} />
        </div>
      ) : (
        <>
          <div className="pl-24 pt-8 text-sm">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  props.tabs?.onClickGoToRelation?.();
                }}
                className="max-w-fit pl-8 pb-2"
              >
                <div className="flex group flex-row items-center rounded-sm italic">
                  <div className="flex flex-row items-center">
                    <div className="flex flex-row gap-1 items-center">
                      <div className="text-foreground/70">
                        {t('detailView.activity.goTo', {
                          name: '',
                        })}
                      </div>
                      <div className="pl-1">
                        {props.tabs?.activeTabField?.icon ? (
                          <>
                            <props.tabs.activeTabField.icon className="h-4 w-4" />
                          </>
                        ) : null}
                      </div>
                      <div>{props.tabs?.activeTabField?.field?.label}</div>
                    </div>
                    <div className="relative w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0">
                      <ChevronRightIcon className="h-3 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </button>

              {activeTabPrimitiveFields.map((field) => {
                if (field.field?.isDisplayField) {
                  return (
                    <div key={field.field?.name + 'primitive'}>
                      <props.FormField {...props} field={field} />
                    </div>
                  );
                }

                return (
                  <div key={field.field?.name + 'primitive'}>
                    <props.FormField {...props} field={field} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pl-24 pt-4 text-sm border-t-[.5px]">
            {activeTabComplexFields.map((field) => {
              return (
                <div key={field.field?.name + 'complex'}>
                  <props.ComplexFormField
                    {...props}
                    field={field}
                    tabFormField={true}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export const detailPage = {
  header: DetailPageHeader,
  formFields: DetailPageFormFields,
  icon: DetailPageIcon,
  propertiesHeader: DetailPagePropertiesHeader,
  propertiesList: DetailPagePropertiesList,
  tabs: DetailTabs,
};
