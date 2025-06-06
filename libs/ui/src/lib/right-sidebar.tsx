import { _filter, RightSidebarProps, useTranslation } from '@apps-next/core';
import { XIcon } from 'lucide-react';
import { CommandsDropdown } from './commands-dropdown';
import { Input, Tabs, TabsContent, TabsList, TabsTrigger } from './components';
import { StarredIcon } from './starred-icon';
import { cn } from './utils';

export const RightSidebar = (props: RightSidebarProps) => {
  const { t } = useTranslation();

  return (
    <div
      key="right-sidebar"
      className={cn(
        'border-l-[1px] border-gray-100 transition-all duration-300 ease-in-out overflow-hidden',
        props.isOpen ? 'w-[26rem] opacity-100' : 'w-0 opacity-0'
      )}
    >
      <div
        className={cn(
          'overflow-y-scroll h-full',
          props.isOpen ? 'w-[26rem] opacity-100' : 'w-0 opacity-0'
        )}
      >
        {props.isOpen ? (
          <div className="flex w-full flex-row items-center px-6 justify-between py-6 border-b-[1px] border-gray-100">
            <div className="flex flex-row gap-2 items-center">
              <>
                {/* <currentView$.icon className="w-4 h-4 text-foreground/70" /> */}
                {props.viewIcon && (
                  <props.viewIcon className="w-4 h-4 text-foreground/70" />
                )}
              </>

              <div className="text-foreground/90">
                {/* All {t(`${props.tableName}.other` as any)} */}
                {props.viewName}
              </div>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <CommandsDropdown {...props.commandsDropdownProps} />

              <StarredIcon {...props} />
            </div>
          </div>
        ) : null}

        <div className="py-6 px-4">
          <SidebarTabs {...props.tabs} tableName={props.tableName} />
        </div>
      </div>
    </div>
  );
};

export const SidebarTabs = ({
  relationalFilterData,
  query,
  onQueryChange,
  currentFilter,
  setFilter,
  activeTab,
  onTabChange,
  tableName,
  getTabProps,
  getUserView,
}: RightSidebarProps['tabs'] & {
  tableName: RightSidebarProps['tableName'];
}) => {
  const data = relationalFilterData;

  const { t } = useTranslation();

  if (!data) {
    return <></>;
  }

  const allowed = Object.keys(data);
  const hasMultipleTabs = allowed.length > 1;

  return (
    <Tabs
      value={activeTab || allowed[0]}
      onValueChange={(value) => {
        onTabChange(value);
      }}
    >
      {hasMultipleTabs && (
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
      )}

      {!hasMultipleTabs && allowed.length && (
        <div className="mb-3">
          <h3 className="text-sm font-medium text-foreground/90">
            {allowed[0]?.charAt(0).toUpperCase() + allowed[0]?.slice(1)}
          </h3>
        </div>
      )}

      {allowed.map((item) => {
        let rowList = data?.[item] || [];

        const { ids, getCountForRow, shouldNotRender, ...tabProps } =
          getTabProps?.(item) || {};

        const rowsWithCountGreaterThanZero = rowList.reduce((acc, row) => {
          const count = ids.filter((id) => id === row.id).length;

          return count > 0 ? acc + 1 : acc;
        }, 0);

        if (query) {
          rowList = _filter(rowList, ['label']).withQuery(query);
        }

        return (
          <TabsContent
            key={item}
            value={item}
            className={cn(
              'flex flex-col mt-0',
              activeTab === item
                ? 'max-h-[75vh] overflow-y-scroll'
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
                      value={query}
                      onChange={(e) => {
                        onQueryChange(e.target.value);
                      }}
                    />
                    {query.length ? (
                      <div>
                        <XIcon
                          className="w-4 h-4 text-foreground/70 cursor-pointer"
                          onClick={() => {
                            onQueryChange('');
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <>
                {rowsWithCountGreaterThanZero === 0 ? (
                  <div className="text-foreground/70 pt-4 text-sm grid place-items-center">
                    <div>
                      {t('rightSidebar.noModelUser', {
                        model: t(`${item}.one` as any),
                      })}
                    </div>
                  </div>
                ) : null}

                {rowList?.map((row) => {
                  const isActiveFilter = currentFilter?.id === row.id;
                  const userView = getUserView?.(row.label);
                  const count = getCountForRow(row);

                  if (shouldNotRender(row)) return null;

                  return (
                    <button
                      onClick={() => {
                        if (isActiveFilter) {
                          setFilter(undefined);
                        } else {
                          setFilter({
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
                        ) : tabProps?.icon ? (
                          <tabProps.icon className="w-4 h-4" />
                        ) : (
                          <span className="w-4 h-4">{/*  */}</span>
                        )}
                      </div>
                      <div className="text-[13px]">
                        {row.label || 'No Project.'}
                      </div>

                      <div className="flex-grow" />

                      <div className="cursor-pointer flex flex-row gap-2 items-center text-xs">
                        <div className="group-hover:opacity-100 opacity-0">
                          {isActiveFilter ? (
                            <>Clear Filter</>
                          ) : (
                            <>
                              {/* <div>See {t(`${tableName}.other` as any)}</div> */}
                              <div>
                                {t('rightSidebar.see', {
                                  model: t(`${tableName}.other` as any),
                                })}
                              </div>
                            </>
                          )}
                        </div>
                        <div>{count ?? ''}</div>
                      </div>
                    </button>
                  );
                })}

                {query.length && rowList.length === 0 ? (
                  <div className="text-foreground/70 pt-4 text-sm grid place-items-center">
                    <div>
                      {t('rightSidebar.noResults', {
                        query: query,
                        model: t(`${item}.one` as any),
                      })}
                    </div>
                  </div>
                ) : null}
              </>
            </>
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export const rightSidebar = {
  default: RightSidebar,
};
