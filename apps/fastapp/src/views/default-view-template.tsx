import { api } from '@apps-next/convex';
import {
  _filter,
  MakeConfirmationAlertPropsOption,
  makeData,
  MakeDisplayOptionsPropsOptions,
  MakeFilterPropsOptions,
  MakeListPropsOptions,
  RecordType,
} from '@apps-next/core';
import {
  currentView$,
  getView,
  MakeComboboxPropsOptions,
  store$,
} from '@apps-next/react';
import {
  cn,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@apps-next/ui';
import { convexQuery } from '@convex-dev/react-query';
import { observable } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import { useQuery } from '@tanstack/react-query';
import { Outlet, useParams } from '@tanstack/react-router';
import { StarIcon, XIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  RenderComboboxPopover,
  RenderCommandbar,
  RenderCommandform,
  RenderConfirmationAlert,
  RenderContextmenu,
  RenderDatePickerDialog,
  RenderDisplayOptions,
  RenderFilter,
  RenderInputDialog,
  RenderList,
  RenderPageHeader,
  RenderSaveViewDropdown,
  RenderUserViewForm,
} from './default-components';

export const DefaultViewTemplate = observer(
  <T extends RecordType>(props: {
    listOptions?: MakeListPropsOptions<T>;
    comboboOptions?: MakeComboboxPropsOptions<T>;
    filterOptions?: MakeFilterPropsOptions<T>;
    displayOptions?: MakeDisplayOptionsPropsOptions<T>;
    confirmationAlertOptions?: MakeConfirmationAlertPropsOption<T>;
    RenderInputDialog?: React.FC;
    isSubView?: boolean;
  }) => {
    const { id } = useParams({ strict: false });

    if (props.isSubView) {
      return (
        <div className="p-2 flex flex-col gap-2 grow overflow-scroll">
          <div className="flex flex-row w-full justify-between">
            <div className="grow pr-12 pl-8">
              <RenderFilter options={props.filterOptions} />
            </div>

            <div className="flex flex-row gap-2 mr-4 items-center">
              <RenderDisplayOptions options={props.displayOptions} />

              <RenderSaveViewDropdown />
            </div>
          </div>

          {props.RenderInputDialog ? (
            <props.RenderInputDialog />
          ) : (
            <RenderInputDialog />
          )}

          <div className="flex flex-col w-full ">
            <RenderList options={props.listOptions} />
          </div>
          <hr className="border-none" />

          <Outlet />
        </div>
      );
    }

    const { t } = useTranslation();

    return (
      <>
        {!id ? (
          <div className="pb-2 pt-1 flex flex-col grow">
            {store$.userViewSettings.form.get() ? (
              <div className="ml-8 my-1 border-[1px] border-solid p-2 rounded-md border-gray-100">
                <RenderUserViewForm />
              </div>
            ) : null}

            <div className="flex flex-row w-full justify-between border-gray-100 border-t-[1px] border-b-[1px] text-sm py-2 items-center">
              <div className="pl-8 w-full">
                <RenderPageHeader />
              </div>
            </div>

            <div className="flex flex-row w-full justify-between border-gray-100 border-b-[1px] border-collapse items-center py-1">
              <div className="grow pr-12 pl-8">
                <RenderFilter options={props.filterOptions} />
              </div>

              <div className="flex flex-row gap-2 mr-4 items-center">
                <RenderDisplayOptions options={props.displayOptions} />

                <RenderSaveViewDropdown />
              </div>
            </div>

            {props.RenderInputDialog ? (
              <props.RenderInputDialog />
            ) : (
              <RenderInputDialog />
            )}

            <div className="flex flex-row w-full">
              <div className="overflow-y-scroll flex-grow h-[90vh]">
                <RenderList options={props.listOptions} />
              </div>

              <div
                key="sidebar"
                className={cn(
                  'border-l-[1px] border-gray-100 transition-all duration-300 ease-in-out overflow-hidden',
                  store$.rightSidebar.open.get()
                    ? 'w-[26rem] opacity-100'
                    : 'w-0 opacity-0'
                )}
              >
                <div className="w-[26rem] overflow-y-scroll h-full">
                  <div className="flex w-full flex-row items-center px-6 justify-between py-6 border-b-[1px] border-gray-100">
                    <div className="flex flex-row gap-2 items-center">
                      <>
                        <currentView$.icon className="w-4 h-4 text-foreground/70" />
                      </>

                      <div className="text-foreground/90">
                        All {t(`${currentView$.tableName.get()}.other` as any)}
                      </div>
                    </div>

                    <div>
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                    </div>
                  </div>

                  <div className="py-6 px-4">
                    <TabsDemo />
                  </div>
                </div>
              </div>
            </div>
            {/* <hr /> */}

            <Outlet />
          </div>
        ) : null}

        <RenderContextmenu />
        <RenderConfirmationAlert options={props.confirmationAlertOptions} />
        <RenderCommandbar />
        <RenderCommandform />
        <RenderDatePickerDialog />
        <RenderComboboxPopover options={props.comboboOptions} />
      </>
    );
  }
);

const query$ = observable('');
export const TabsDemo = observer(() => {
  const { data } = useQuery(
    convexQuery(api.query.getViewRelationalFilterOptions, {
      tableName: currentView$.tableName.get() || '',
      withCount: true,
    })
  );

  const queryIsDone = store$.fetchMore.isDone.get();

  const [dataModelRows, setDataModelRows] = React.useState(
    store$.dataModel.rows.get()
  );

  const filter = store$.rightSidebar.filter.get();
  const ignoreNextRef = React.useRef(false);

  React.useEffect(() => {
    if (filter) {
      ignoreNextRef.current = true;
    }
  }, [filter]);

  const rows = store$.dataModel.rows.get();
  React.useEffect(() => {
    if (ignoreNextRef.current) {
      ignoreNextRef.current = false;
      return;
    }

    if (rows) setDataModelRows(rows);
  }, [rows]);

  const [activeTab, setActiveTab] = React.useState('');
  const userViews = store$.userViews.get();
  const { t } = useTranslation();

  if (!data) {
    return <></>;
  }

  const allowed = Object.keys(data) ?? [];
  return (
    <Tabs
      value={activeTab || allowed[0]}
      onValueChange={(value) => {
        setActiveTab(value);
      }}
    >
      <TabsList
        className={cn(
          'grid w-full text-foreground/70 font-normal bg-foreground/5 rounded-sm text-xs h-[1.6rem] p-0 py-0',
          `grid-cols-${allowed.length}`
        )}
      >
        {allowed.map((item) => {
          return (
            <TabsTrigger
              key={item}
              value={item}
              className="text-xs h-6 font-normal"
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {allowed.map((item) => {
        const rows = data?.[item];

        const idsOfModel = dataModelRows
          .map((r) => {
            const valueOrValues = r.raw?.[item];
            const isArray = Array.isArray(valueOrValues);
            return isArray
              ? valueOrValues.map((v) => v.id || v)
              : valueOrValues?.id || valueOrValues;
          })
          .flat();

        const rowsWithCountGreaterThanZero = rows.reduce((acc, row) => {
          const count = idsOfModel.filter((id) => id === row.record.id).length;

          return count > 0 ? acc + 1 : acc;
        }, 0);

        const view = getView(item);

        const makeRow = (record: RecordType) =>
          makeData(store$.views.get(), item)([record])?.rows?.[0];

        let rowList = rows.map((r) => {
          const row = makeRow(r.record);
          row.raw = {
            ...row.raw,
            count: r.count,
          };
          return row;
        });

        if (query$.get()) {
          rowList = _filter(rowList, ['label']).withQuery(query$.get());
        }

        const stateIsFilterChanged = store$.state.get() === 'filter-changed';

        const currentFilter = store$.rightSidebar.filter.get();

        return (
          <TabsContent
            key={item}
            value={item}
            className={cn(
              'flex flex-col',
              activeTab === item
                ? 'max-h-[50vh] overflow-y-scroll'
                : 'max-h-[70vh] overflow-scroll'
            )}
          >
            <>
              <div className="px-1 py-1 flex flex-row">
                {rowsWithCountGreaterThanZero > 4 ? (
                  <div className="flex flex-row gap-2 items-center justify-between w-full">
                    <Input
                      className="w-full text-xs py-0 flex-grow"
                      placeholder={t('search.placeholder')}
                      value={query$.get()}
                      onChange={(e) => {
                        query$.set(e.target.value);
                      }}
                    />
                    {query$.get().length ? (
                      <div>
                        <XIcon
                          className="w-4 h-4 text-foreground/70 cursor-pointer"
                          onClick={() => {
                            query$.set('');
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <>
                {rowsWithCountGreaterThanZero === 0 ? (
                  <div className="text-foreground/70 text-sm grid place-items-center">
                    <div>No Labels used</div>
                  </div>
                ) : null}

                {rowList?.map((row) => {
                  const isActiveFilter = currentFilter?.id === row.id;
                  const userView = userViews.find((v) => v.name === row.label);
                  const count =
                    queryIsDone || stateIsFilterChanged
                      ? idsOfModel.filter((id) => id === row.id).length
                      : row.raw?.count;
                  if (count === 0 && (queryIsDone || stateIsFilterChanged))
                    return null;

                  return (
                    <button
                      onClick={() => {
                        if (isActiveFilter) {
                          store$.rightSidebar.filter.set(undefined);
                        } else {
                          store$.rightSidebar.filter.set({
                            tableName: item,
                            id: row.id,
                          });
                        }
                      }}
                      key={row.id}
                      className={cn(
                        'py-2 group px-4 flex flex-row gap-2 items-center text-foreground/90',
                        isActiveFilter
                          ? 'bg-foreground/10 text-foreground'
                          : ' hover:bg-foreground/5',
                        currentFilter && !isActiveFilter
                          ? 'text-foreground/60'
                          : ''
                      )}
                    >
                      <div>
                        {userView?.emoji ? (
                          <span className="w-4 h-4">
                            {userView.emoji.emoji}
                          </span>
                        ) : view?.icon ? (
                          <view.icon className="w-4 h-4" />
                        ) : (
                          <span className="w-4 h-4">{/*  */}</span>
                        )}
                      </div>
                      <div className="text-[13px]">{row.label}</div>

                      <div className="flex-grow" />

                      <div className="cursor-pointer flex flex-row gap-2 items-center text-xs">
                        <div className="group-hover:opacity-100 opacity-0">
                          {isActiveFilter ? (
                            <>Clear Filter</>
                          ) : (
                            <>
                              <div>
                                See{' '}
                                {t(
                                  `${currentView$.tableName.get()}.other` as any
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        <div>{count ?? ''}</div>
                      </div>
                    </button>
                  );
                })}
              </>
            </>
          </TabsContent>
        );
      })}
    </Tabs>
  );
});
