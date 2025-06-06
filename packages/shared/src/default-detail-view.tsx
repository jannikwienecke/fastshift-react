import {
  FormFieldProps,
  HistoryType,
  MakeDetailPropsOption,
} from '@apps-next/core';
import {
  FormField,
  makeHooks,
  RenderActivityList,
  RenderDetailComplexValue,
  TabsFormField,
} from '@apps-next/react';
import { Button, cn, CommandsDropdown, detailPage } from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import { Outlet } from '@tanstack/react-router';
import { ChevronsUpDown, CopyIcon } from 'lucide-react';
import { RenderPageHeaderDetail } from './render-components';

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

          <div className="min-w-64 max-w-80 border-t pl-8 pr-4 ">
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

    const primaryStyleOpts =
      props.commands.primaryCommand?.primaryCommandOptions ?? {};
    return (
      <>
        <div data-testid="detail-form" className="pt-6 flex flex-col gap-4">
          <div className="pl-20">
            <div className="pb-8 flex flex-row items-center justify-between border-b border-gray-100">
              <div className="flex flex-row items-center gap-2">
                <detailPage.icon {...props} />
                <div className="text-foreground/70 font-mono text-[11px]">
                  <div className="">Record Info</div>
                  <div className="flex flex-row items-center gap-1">
                    <div className="">{props.tableName}</div>
                    <div>|</div>
                    <div className="">ID:{props.row.id}</div>
                    <button onClick={() => null}>
                      <CopyIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mr-8 flex flex-row items-center gap-2">
                {props.commands.primaryCommand ? (
                  <Button
                    size={'sm'}
                    variant={'outline'}
                    className={cn(
                      'group relative flex flex-row items-center gap-1 transition-all duration-300 ease-in-out hover:shadow-lg',
                      primaryStyleOpts.style?.type === 'success'
                        ? 'text-green-600 border-green-300 hover:bg-green-200 hover:text-green-800 hover:shadow-green-200/50'
                        : primaryStyleOpts.style?.type === 'danger'
                        ? 'border-red-300 text-red-600 hover:bg-red-200 hover:text-red-800 hover:shadow-red-200/50'
                        : 'text-foreground hover:bg-gray-100 hover:shadow-gray-200/50'
                    )}
                    onClick={() =>
                      props.commands.primaryCommand &&
                      props.commands.commandsDropdownProps.onSelectCommand?.(
                        props.commands.primaryCommand
                      )
                    }
                  >
                    <div
                      className={cn(
                        'transition-colors duration-200',
                        primaryStyleOpts.style?.type === 'success'
                          ? 'text-green-600 group-hover:text-green-800'
                          : primaryStyleOpts.style?.type === 'danger'
                          ? 'text-red-600 group-hover:text-red-800'
                          : 'text-foreground group-hover:text-foreground'
                      )}
                    >
                      {props.commands.primaryCommand.icon ? (
                        <props.commands.primaryCommand.icon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                      ) : null}
                    </div>
                    <div
                      className={cn(
                        'text-xs font-medium transition-all duration-200',
                        primaryStyleOpts.style?.type === 'success'
                          ? 'text-green-600 group-hover:text-green-800'
                          : primaryStyleOpts.style?.type === 'danger'
                          ? 'text-red-600 group-hover:text-red-800'
                          : 'text-foreground group-hover:text-foreground'
                      )}
                    >
                      {props.commands.primaryCommand.label}
                    </div>
                    <div
                      className={cn(
                        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md',
                        primaryStyleOpts.style?.type === 'success'
                          ? 'bg-gradient-to-r from-green-100/0 via-green-100/20 to-green-100/0'
                          : primaryStyleOpts.style?.type === 'danger'
                          ? 'bg-gradient-to-r from-red-100/0 via-red-100/20 to-red-100/0'
                          : 'bg-gradient-to-r from-gray-100/0 via-gray-100/10 to-gray-100/0'
                      )}
                    />
                  </Button>
                ) : null}

                <CommandsDropdown {...props.commands.commandsDropdownProps}>
                  <div
                    className="flex flex-row items-center gap-1"
                    onClick={(e) => {
                      props.commands.commandsDropdownProps.onOpenCommands?.(
                        true
                      );
                    }}
                  >
                    <div className="text-xs">Commands</div>
                    <ChevronsUpDown className="size-4" />
                  </div>
                </CommandsDropdown>
              </div>
            </div>

            <div className="mt-4">
              <detailPage.formFields
                {...props}
                FormField={templateProps.FormField ?? FormField}
              />
            </div>
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
