import { tasksConfig } from '@apps-next/convex';
import {
  ComboboxPopoverProps,
  ComboxboxItem,
  FieldConfig,
  RegisteredViews,
  Row,
} from '@apps-next/core';
import {
  ClientViewProviderConvex,
  getViewConfigAtom,
  getViewFieldsConfig,
  getViews,
  makeHooks,
  QueryInput,
  registeredViewsAtom,
  setViewFieldsConfig,
  useCombobox,
  useFilter,
  useHandleSelectCombobox,
  useStoreValue,
  useView,
} from '@apps-next/react';
import { ComboboxPopover, List } from '@apps-next/ui';
import { CodeIcon, Cross2Icon, MixIcon } from '@radix-ui/react-icons';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { config } from '../global-config';
import {
  CompletedComponent,
  PriorityComponent,
  PriorityComponentCombobox,
  ProjectComponent,
  ProjectComponentCombobox,
  TagsComponent,
  TaskViewDataType,
} from '../views/tasks.components';

setViewFieldsConfig<TaskViewDataType>('tasks', {
  fields: {
    tags: {
      component: {
        list: TagsComponent,
      },
    },
    completed: {
      component: {
        list: CompletedComponent,
        // combobox: CompletedComponent,
      },
    },

    priority: {
      component: {
        list: PriorityComponent,
        combobox: PriorityComponentCombobox,
      },
    },

    projects: {
      component: {
        list: ProjectComponent,
        combobox: ProjectComponentCombobox,
      },
    },
  },
});

type FilterState = {
  query: string;
  values: ComboxboxItem[];
  open: boolean;
  tableName: string;
  id: string | null;
  registeredViews: RegisteredViews;
  selectedField: FieldConfig | null;
};

const DEFAULT_FILTER_STATE: FilterState = {
  query: '',
  values: [],
  open: false,
  tableName: '',
  id: null,
  registeredViews: {},
  selectedField: null,
};

const filterStateAtom = atom<FilterState>(DEFAULT_FILTER_STATE);

const openFilterAtom = atom(false, (get, set, open: boolean) => {
  const viewConfigManager = get(getViewConfigAtom);
  const viewFields = viewConfigManager.getViewFieldList();

  const values = viewFields.map((field) => {
    return {
      id: field.name,
      label: field.name,
    };
  });

  set(filterStateAtom, { ...get(filterStateAtom), open, values });
});

const selectFilterAtom = atom(null, (get, set, value: ComboxboxItem) => {
  const viewConfigManager = get(getViewConfigAtom);
  const field = viewConfigManager.getFieldBy(value.id.toString());

  set(filterStateAtom, { ...get(filterStateAtom), selectedField: field });
});

const closeFilterAtom = atom(null, (get, set) => {
  console.log('CLOSE FILTER');
  set(filterStateAtom, { ...get(filterStateAtom), ...DEFAULT_FILTER_STATE });
});

// TASK FOR AI CURSOR:
// write filter function
// have an adapter for handling the logic and state
// use the combobox-popover for displaying the combobox
// have a button for opening the combobox
// when clicking the button, set the open to true
// we set the initail state of the combobox
// that means we need a list of all the fields of the view
// e.g. for tasks that would mean:
// - tags
// - priority
// - completed
// - projects
// - ...
// when typinh in the input field we want to filter the fields based on the name of it
// when clicking on a field we want to update the state
// we now want to show the options for that field
// for projects -> we have a combobox that shows all the projects
// for a enum fields -> we have a combobox that shows all the options of that field
// and so on. We can utilize the useCombobox hook for this

function useFilterAdapter({
  onSelect,
}: {
  onSelect: (props: { field: FieldConfig; value: Row }) => void;
}) {
  const { viewConfigManager } = useView();
  const { filter } = useFilter();

  const filterState = useAtomValue(filterStateAtom);
  const open = useSetAtom(openFilterAtom);
  const select = useSetAtom(selectFilterAtom);
  const close = useSetAtom(closeFilterAtom);

  const getComboboxProps = useCombobox({
    state: {
      field: filterState.selectedField,
      row: filterState.selectedField ? 'row' : null,
      rect: {} as DOMRect,
      selected: [],
      multiple: filterState.selectedField?.relation ? true : false,
    },
    onClose: () => {
      close();
    },
    onSelect: (value) => {
      if (!filterState.selectedField) return;
      onSelect({
        field: filterState.selectedField,
        value: value as Row,
      });
    },
  });

  const getFilterComboboxProps = (): ComboboxPopoverProps<ComboxboxItem> => {
    const comboboxProps = getComboboxProps();
    if (comboboxProps.open && filterState.selectedField) {
      return {
        ...comboboxProps,
        onChange: (v) => comboboxProps.onChange(v as Row),
        render: (v) => {
          return comboboxProps.render(v as Row);
        },
      };
    }

    return {
      ...filterState,
      name: 'filter',
      multiple: false,
      searchable: true,
      rect: null,
      input: {
        onChange: (query) => {
          console.log('onChange', query);
        },
        query: filterState.query,
        placeholder: 'Filter...',
      },
      selected: null,
      onChange: (value) => {
        console.log('SELECT!!!');
        select(value);
      },

      onOpenChange: (open) => {
        console.log('onOpenChange', open);
        if (!open) {
          close();
        }
      },
      render: (value) => {
        const field = viewConfigManager.getFieldBy(value.id.toString());

        return (
          <div className="flex flex-row gap-2 items-center">
            <span>
              <CodeIcon className="w-4 h-4" />
            </span>
            <span>{field.name.firstUpper()}</span>
          </div>
        );
      },
    };
  };

  const handleOpen = () => {
    open(true);
  };

  const getFilterDisplayProps = () => {
    return {
      ...filter,
      onOpen: handleOpen,
      label: 'Filter...',
    };
  };

  return {
    getFilterComboboxProps,
    getFilterDisplayProps,
  };
}

const Task = () => {
  const { filter, setFilter } = useFilter();
  const { useList } = makeHooks<TaskViewDataType>();
  const getListProps = useList();

  const registeredViews = useAtomValue(registeredViewsAtom);

  const { handleClose, handleSelect } = useHandleSelectCombobox();
  const { getFilterComboboxProps, getFilterDisplayProps } = useFilterAdapter({
    onSelect: (props) => {
      setFilter({
        field: props.field,
        value: props.value,
      });
    },
  });

  // // TODO: we should not save it on list -> but have like selected: {type: "list or whatever"}
  const { list } = useStoreValue();

  const getComboboxProps = useCombobox({
    state: list?.focusedRelationField ? list.focusedRelationField : null,
    onSelect: handleSelect,
    onClose: handleClose,
  });

  const filterDisplayProps = getFilterDisplayProps();
  return (
    <div className="p-2 flex flex-col gap-2 grow overflow-scroll">
      <div className="flex flex-col w-full ">
        <div className="flex flex-row gap-2 items-center">
          {filter.fitlers.length > 0 && (
            <div className="flex flex-row gap-2 items-center flex-wrap text-xs">
              {filter.fitlers.map((f) => {
                const view = registeredViews[f.field.name];
                if (!view?.icon) return null;
                return (
                  <div
                    key={`filter-${f.field.name}-${f.operator}`}
                    className="border border-input rounded-sm text-muted-foreground "
                  >
                    <div className="flex flex-row items-center flex-wrap">
                      <div className="flex items-center gap-[1px] border-r-[1px] pl-2 border-r-input/30 pr-2 py-1">
                        <div>
                          <view.icon className="w-4 h-4 text-foreground" />
                        </div>
                        <div>{f.field.name.firstUpper()}</div>
                      </div>

                      <div className="border-r-[1px] py-1 border-r-input/30 px-3 hover:bg-accent">
                        {f.operator.label}
                      </div>

                      <div className="flex items-center px-1 gap-[1px] border-r-[1px] border-r-input/30 pr-2 py-1 hover:bg-accent">
                        <div>
                          <view.icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          {f.type === 'relation' ? (
                            <>
                              {f.values.length === 1 ? (
                                <>{f.values[0].label}</>
                              ) : (
                                <>
                                  {f.values.length} {f.field.name}
                                </>
                              )}
                            </>
                          ) : (
                            ''
                          )}
                        </div>
                      </div>

                      <div className="px-2 hover:bg-accent py-1">
                        <Cross2Icon className="w-4 h-4 text-foreground" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <ComboboxPopover {...getFilterComboboxProps()}>
            <button
              onClick={filterDisplayProps.onOpen}
              className="flex flex-row text-xs items-center p-1 px-2 rounded-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              <MixIcon className="w-4 h-4" />
              {filter.fitlers.length ? (
                <span></span>
              ) : (
                <span className="pl-2">Filter</span>
              )}
            </button>
          </ComboboxPopover>
        </div>
      </div>

      <ComboboxPopover {...getComboboxProps()} />

      <div className="flex flex-col w-full ">
        <QueryInput />

        <List.Default
          {...getListProps({
            fieldsRight: ['tags', 'priority', 'completed'],
            fieldsLeft: ['name', 'projects'],
          })}
        />
      </div>
      <hr />

      <Outlet />
    </div>
  );
};

export const Route = createFileRoute('/fastApp/tasks')({
  loader: async ({ context }) => context.preloadQuery(tasksConfig),
  component: () => {
    return (
      <ClientViewProviderConvex
        viewConfig={tasksConfig}
        globalConfig={config.config}
        views={getViews()}
        viewFieldsConfig={getViewFieldsConfig()}
      >
        <Task />
      </ClientViewProviderConvex>
    );
  },
});

// STATE: FILTERS
// - it kind of works, we need a lot of clean up
// and the query builder for the filter is not yet generic
// we need to extract the ui component for the filter
// we need to move the filter adapter to its own folder and files
// we need to handle the different operations like is in or is not in
// we need to persist the filters somewhere (own db table that we expose?)
// we need to update the ui so that we can update the filters
// we need to pass in the current active filters to the filter adapter so it shows what is currently active
// we need to style the ui
