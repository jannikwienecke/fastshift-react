import { config, tasksConfig, views } from '@apps-next/convex';
import {
  ContextMenuUiOptions,
  makeDayMonthString,
  MakeDisplayOptionsPropsOptions,
  MakeFilterPropsOptions,
  MakeListPropsOptions,
  RecordType,
} from '@apps-next/core';
import {
  ClientViewProviderConvex,
  MakeComboboxPropsOptions,
  makeHooks,
  MakeInputDialogPropsOptions,
  makeViewFieldsConfig,
  QueryInput,
  useComboboxQuery,
} from '@apps-next/react';
import {
  Checkbox,
  cn,
  ComboboxPopover,
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  DisplayOptions,
  Filter,
  InputDialog,
  List,
} from '@apps-next/ui';
import { Memo, observer } from '@legendapp/state/react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import {
  BarChartHorizontal,
  CalendarIcon,
  CheckIcon,
  CopyIcon,
  Pencil,
  PencilIcon,
  PencilLineIcon,
  TrashIcon,
} from 'lucide-react';
import React from 'react';
import { getQueryKey } from '../query-client';
import {
  CompletedComponent,
  CompletedComponentCombobox,
  PriorityComponent,
  PriorityComponentCombobox,
  ProjectComponent,
  ProjectComponentCombobox,
  TagsComponent,
  TagsDefaultComponent,
  TaskViewDataType,
} from '../views/tasks.components';

const viewFieldsConfig = makeViewFieldsConfig<TaskViewDataType>('tasks', {
  fields: {
    tags: {
      component: {
        list: TagsComponent,
        contextmenuFieldOption: TagsDefaultComponent,
      },
    },
    completed: {
      component: {
        list: CompletedComponent,
        combobox: CompletedComponentCombobox,
      },
    },

    priority: {
      component: {
        icon: BarChartHorizontal,
        list: PriorityComponent,
        combobox: PriorityComponentCombobox,
        contextmenuFieldOption: PriorityComponentCombobox,
      },
    },

    name: {
      component: {
        icon: PencilLineIcon,
        contextmenuFieldItem({ field }) {
          return <>Rename Task</>;
        },
      },
    },

    projects: {
      component: {
        list: ProjectComponent,
        combobox: ProjectComponentCombobox,
        contextmenuFieldOption: ProjectComponentCombobox,
      },
    },
    dueDate: {
      component: {
        list: ({ data }) => {
          if (!data.dueDate) return null;

          const date = new Date(data.dueDate);

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const isInTheNext7Days =
            date.getTime() >= today.getTime() &&
            date.getTime() < new Date().getTime() + 7 * 24 * 60 * 60 * 1000;

          const isOverdue = date.getTime() < today.getTime();

          return (
            <div className="flex flex-row items-center gap-1 border border-foreground/10 rounded-lg px-1 p-1">
              <div>
                <CalendarIcon
                  className={cn(
                    'w-4 h-4',
                    isInTheNext7Days
                      ? 'text-orange-500'
                      : isOverdue
                      ? 'text-red-500'
                      : 'text-foreground/80'
                  )}
                />
              </div>
              <span className="text-xs text-foreground/80">
                {makeDayMonthString(date)}
              </span>
            </div>
          );
        },
        combobox: ({ data }) => {
          return (
            <div className="flex items-center gap-1">
              <div>
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>{data}</div>
            </div>
          );
        },
      },
    },
  },
});

const Task = observer(() => {
  const { makeInputDialogProps } = makeHooks<TaskViewDataType>();
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  // return (
  //   <div className="relative">
  //     <div className="h-32 w-32"></div>
  //     <div
  //       className="h-32 left-32 relative"
  //       onContextMenu={(e) => {
  //         console.log('click');
  //         e.preventDefault();
  //         e.stopPropagation();
  //         setRect(e.currentTarget.getBoundingClientRect());
  //       }}
  //     >
  //       RIGHT CLICK FOR CONTEXT MENU
  //     </div>

  //     <ContextMenuDemo rect={rect} />
  //   </div>
  // );

  return (
    <DefaultTemplate<TaskViewDataType>
      listOptions={{
        fieldsLeft: ['name', 'projects', 'dueDate'],
        fieldsRight: ['tags', 'completed', 'priority'],
      }}
      filterOptions={{
        hideFields: ['subtitle'],
      }}
      RenderInputDialog={observer(() => (
        <InputDialog.Default {...makeInputDialogProps({})} />
      ))}
    />
  );
});

const DefaultTemplate = observer(
  <T extends RecordType>(props: {
    listOptions?: MakeListPropsOptions<T>;
    comboboOptions?: MakeComboboxPropsOptions<T>;
    filterOptions?: MakeFilterPropsOptions<T>;
    RenderInputDialog?: React.FC;
    // ...render methods for all components
    // ...options for all components
  }) => {
    return (
      <div className="p-2 flex flex-col gap-2 grow overflow-scroll">
        <div className="flex flex-col w-full ">
          <RenderFilter options={props.filterOptions} />
        </div>

        <RenderComboboxPopover options={props.comboboOptions} />

        {props.RenderInputDialog ? (
          <props.RenderInputDialog />
        ) : (
          <RenderInputDialog />
        )}

        <RenderContextmenu />

        <div className="flex flex-col w-full ">
          <div className="flex flex-row gap-2 justify-end">
            <RenderDisplayOptions
              options={{
                sorting: { defaultSortingField: 'name' },
                displayFieldsToShow: [
                  'name',
                  'completed',
                  'description',
                  'name',
                  'priority',
                  'projects',
                  'tags',
                ],
              }}
            />
          </div>

          <RenderList options={props.listOptions} />
        </div>
        <hr />

        <Outlet />
      </div>
    );
  }
);

const RenderComboboxPopover = observer(
  ({ options }: { options?: MakeComboboxPropsOptions }) => {
    console.warn('Render Combobox Popover');
    const { makeComboboxProps } = makeHooks<RecordType>();

    return (
      <>
        <Memo>
          {() => {
            useComboboxQuery();
            return <ComboboxPopover {...makeComboboxProps(options)} />;
          }}
        </Memo>
      </>
    );
  }
);

const RenderFilter = observer(
  ({ options }: { options?: MakeFilterPropsOptions }) => {
    console.warn('Render Filter');
    const { makeFilterProps } = makeHooks<TaskViewDataType>();
    return (
      <Memo>
        {() => {
          return <Filter.Default {...makeFilterProps(options)} />;
        }}
      </Memo>
    );
  }
);

const RenderDisplayOptions = observer(
  ({
    options,
  }: {
    options: MakeDisplayOptionsPropsOptions<TaskViewDataType>;
  }) => {
    const { makeDisplayOptionsProps, makeContextmenuProps } =
      makeHooks<TaskViewDataType>();
    const props = makeDisplayOptionsProps(options);

    return (
      <div className="mr-8">
        <DisplayOptions.Default {...props} />
      </div>
    );
  }
);

const RenderInputDialog = observer(
  (props: { options?: MakeInputDialogPropsOptions }) => {
    console.warn('Render Input Dialog');
    const { makeInputDialogProps } = makeHooks<TaskViewDataType>();

    return (
      <Memo>
        {() => {
          return (
            <InputDialog.Default {...makeInputDialogProps(props.options)} />
          );
        }}
      </Memo>
    );
  }
);

const RenderQueryInput = observer(() => {
  console.warn('Render Query Input');
  return <QueryInput />;
});

const RenderList = observer((props: { options?: MakeListPropsOptions }) => {
  const { makeListProps } = makeHooks<TaskViewDataType>();
  console.warn('Render List');

  return (
    <Memo>
      {() => {
        return <List.Default {...makeListProps(props.options)} />;
      }}
    </Memo>
  );
});

const RenderContextmenu = observer(() => {
  const { makeContextmenuProps } = makeHooks<TaskViewDataType>();

  return (
    <Memo>
      {() => {
        return <ContextMenuDefault {...makeContextmenuProps({})} />;
      }}
    </Memo>
  );
});

const ContextMenuDefault = ({ rect, ...props }: ContextMenuUiOptions) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (!rect) return;
    //   manually fire a right click event
    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: rect.left,
      clientY: rect.y,
    });
    ref.current?.dispatchEvent(event);
  }, [rect]);

  const [canBeClosed, setCanBeClosed] = React.useState(false);

  React.useEffect(() => {
    if (!props.isOpen) {
      setCanBeClosed(false);
      return;
    }

    setTimeout(() => {
      setCanBeClosed(true);
    }, 700);
  }, [props.isOpen]);

  return (
    <ContextMenu
      modal={true}
      onOpenChange={(open) => {
        !open && canBeClosed && props.onClose();
      }}
    >
      <ContextMenuTrigger
        ref={ref}
        className="w-0 h-0 invisible"
      ></ContextMenuTrigger>

      <ContextMenuContent className="w-56">
        {/* <ContextMenuSeparator /> */}

        {props.fields?.map((field) => {
          const isEnumOrRelationalField = field.enum || field.relation;
          const isManyToMany = field.relation?.manyToManyTable;
          if (!isEnumOrRelationalField) {
            return (
              <ContextMenuItem key={field.name}>
                <div className="w-full flex flex-row items-center">
                  <div className="pr-2">
                    {field.Icon ? (
                      <field.Icon className="w-4 h-4" />
                    ) : (
                      // <div className="w-4 h-4"></div>
                      <PencilIcon className="w-3 h-3" />
                    )}
                  </div>

                  {/* TODO  HIER WEITER MACHEN */}
                  {props.renderField(field)}

                  <ContextMenuShortcut>
                    ⌘{field.name.slice(0, 1).firstUpper()}
                  </ContextMenuShortcut>
                </div>
              </ContextMenuItem>
            );
          }

          return (
            <ContextMenuSub key={field.name}>
              <ContextMenuSubTrigger className="w-full">
                <div className="w-full flex flex-row items-center">
                  <div className="pr-2">
                    {field.Icon ? (
                      <field.Icon className="w-4 h-4" />
                    ) : (
                      <PencilIcon className="w-3 h-3" />
                    )}
                  </div>

                  {props.renderField(field)}

                  <ContextMenuShortcut>
                    ⌘{field.name.slice(0, 1).firstUpper()}
                  </ContextMenuShortcut>
                </div>
              </ContextMenuSubTrigger>

              <ContextMenuSubContent className="w-48">
                <>
                  {field.relation ? (
                    <>
                      <input
                        type="text"
                        placeholder="Filter..."
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm px-2 outline-none border-none w-full py-1"
                      />
                      <ContextMenuSeparator />
                    </>
                  ) : null}

                  {field.selected?.map((row) => {
                    return (
                      <ContextMenuItem
                        key={`selected-${row.id}`}
                        className="group"
                      >
                        {isManyToMany ? (
                          <div className="pr-2">
                            <Checkbox
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={(e) => {
                                field.onCheckOption(row);
                              }}
                              checked
                              className="h-4 w-4"
                            />
                          </div>
                        ) : (
                          <CheckIcon className="w-4 h-4 mr-1" />
                        )}
                        <div>{props.renderOption(row, field)}</div>
                      </ContextMenuItem>
                    );
                  })}

                  {field.options?.map((row) => {
                    return (
                      <ContextMenuItem
                        key={`option-${row.id}`}
                        className="group"
                        onClick={() => field.onSelectOption(row)}
                      >
                        {isManyToMany ? (
                          <div className="invisible group-hover:visible pr-2">
                            <Checkbox
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={() => {
                                field.onCheckOption(row);
                              }}
                              className="h-4 w-4"
                            />
                          </div>
                        ) : (
                          <div className="h-4 w-4 mr-1"></div>
                        )}
                        <div>{props.renderOption(row, field)}</div>
                      </ContextMenuItem>
                    );
                  })}

                  {field.relation ? (
                    <>
                      <ContextMenuSeparator />
                      <ContextMenuItem className="flex flex-row items-center">
                        <div className="h-4 w-4 mr-1" />
                        <div className="flex-1">{'12 more items...'}</div>
                      </ContextMenuItem>
                    </>
                  ) : null}
                </>
              </ContextMenuSubContent>
            </ContextMenuSub>
          );
        })}

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <div className="flex flex-row items-center">
              <div className="pr-2">
                <CopyIcon className="w-3 h-3" />
              </div>
              <div>Copy</div>
            </div>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>
              Copy ID
              <ContextMenuShortcut>⌘.</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>Copy URL</ContextMenuItem>
            <ContextMenuItem>Copy as JSON</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem>
          <div className="flex flex-row items-center">
            <div className="pr-2">
              <TrashIcon className="w-3 h-3" />
            </div>
            <div>Delete Task</div>
          </div>
          <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export const Route = createFileRoute('/fastApp/tasks')({
  loader: async ({ context }) => context.preloadQuery(tasksConfig),
  component: () => {
    return (
      // write abstaction -> Application code - not lib code
      <ClientViewProviderConvex
        viewConfig={tasksConfig}
        globalConfig={config.config}
        views={views}
        viewFieldsConfig={viewFieldsConfig}
        queryKey={getQueryKey(tasksConfig)}
      >
        <Task />
      </ClientViewProviderConvex>
    );
  },
});
