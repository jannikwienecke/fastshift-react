import {
  historyConfig,
  HistoryViewDataType,
  ownerConfig,
} from '@apps-next/convex';
import { makeDayMonthStringWithTime, Row } from '@apps-next/core';
import {
  getView,
  makeHooks,
  makeViewFieldsConfig,
  store$,
  viewRegistry,
} from '@apps-next/react';
import { BubbleItem, cn, detailPage } from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { ClockIcon, LinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DefaultDetailViewTemplate } from './default-detail-view-template';
import { DefaultViewTemplate } from './default-view-template';
const colorMap: Record<string, string> = {
  insert: 'bg-green-100 text-green-700 border-green-300',
  update: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  delete: 'bg-red-100 text-red-700 border-red-300',
};

const uiViewConfig = makeViewFieldsConfig<HistoryViewDataType>('history', {
  fields: {
    entityId: {
      component: {
        comboboxListValue: ({ data }) => {
          return <>hier</>;
        },
      },
    },
    timestamp: {
      component: {
        icon: ClockIcon,
        detailValue: ({ data }) => {
          return (
            <div className="text-foreground/60 text-sm flex flex-row gap-2 items-center">
              <ClockIcon className="w-4 h-4" />
              {makeDayMonthStringWithTime(new Date(data.timestamp))}
            </div>
          );
        },
      },
    },
    tableName: {
      component: {
        filterValue: ({ data }) => {
          return <>{t(`navigation.${data}` as any)}</>;
        },

        detailValue: ({ data }) => {
          const Icon = getView(data.tableName)?.icon;
          return (
            <BubbleItem
              label={data.tableName ?? ''}
              icon={() => (Icon ? <Icon className="w-4 h-4" /> : null)}
            />
          );
        },

        comboboxListValue: ({ data }) => {
          const Icon = getView(data)?.icon;
          return (
            <div className="text-foreground flex flex-col">
              <div className="text-sm text-mono text-foreground/60 flex flex-row gap-2 items-center">
                {Icon ? (
                  <Icon className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4" />
                )}
                <div>{t(`navigation.${data}` as any)}</div>
              </div>
            </div>
          );
        },
        list: ({ data }) => {
          const Icon = getView(data.tableName)?.icon;
          return (
            <div className="text-foreground flex flex-col">
              <div className="text-sm uppercase text-mono text-foreground/60 flex flex-row gap-2 items-center">
                {Icon ? (
                  <Icon className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4" />
                )}
                <div>
                  {data.tableName}{' '}
                  {makeDayMonthStringWithTime(new Date(data.timestamp))}
                </div>
              </div>

              <Link
                to={'/fastApp/$view/$id/overview'}
                preload="intent"
                params={{
                  view: data.tableName,
                  id: data.record.id,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-sm flex flex-row gap-2 items-center cursor-pointer hover:underline hover:text-blue-400"
              >
                <div>{data.recordLabel}11</div>
                <LinkIcon className="w-4 h-4 text-foreground/60 text-blue-500 " />
              </Link>
            </div>
          );
        },
      },
    },
    owner: {
      component: {
        detailValue: ({ data }) => {
          return (
            <BubbleItem
              label={data.creator.label ?? 'Set User Email'}
              icon={() => <ownerConfig.icon className="w-4 h-4" />}
            />
          );
        },
        list: ({ data }) => {
          return (
            <BubbleItem
              label={data.creator.label ?? ''}
              icon={() => <ownerConfig.icon className="w-4 h-4" />}
            />
          );
        },
      },
    },
    change: {
      component: {
        list: ({ data }) => {
          if (
            data.changed.type === 'added' ||
            data.changed.type === 'removed'
          ) {
            const color =
              data.changed.type === 'added' ? 'text-green-500' : 'text-red-500';
            return (
              <div className="flex flex-row text-xs items-center gap-2 py-1 px-2 bg-foreground/10 border border-gray-300 rounded-md shadow-sm">
                <div className={color}>
                  {data.changed.type === 'added' ? 'Added' : 'Removed'}
                </div>

                <span className="font-medium text-gray-700 px-2 py-1 border-foreground/30 border-[1px] rounded-md">
                  {t(`${data.changed.fieldName}.one` as any)}
                </span>

                <span className={cn('text-foreground font-bold', color)}>
                  {data.changed.label}
                </span>
              </div>
            );
          }

          if (
            data.changed.type === 'changed' ||
            data.changed.type === 'added-to' ||
            data.changed.type === 'removed-from'
          ) {
            return (
              <div className="flex flex-row text-xs items-center gap-2 py-1 px-2 bg-foreground/10 border border-gray-300 rounded-md shadow-sm">
                <span className="font-medium text-gray-700">
                  {/* data.changed.fieldName */}
                  {t(`${data.changed.fieldName}.one` as any)}
                </span>
                <span className="text-foreground/80">:</span>
                <span className="text-red-400 line-through max-w-[200px] truncate ">
                  {data.changed.oldValue?.toString()}
                </span>

                {data.changed.newValue && data.changed.oldValue ? (
                  <>
                    <span className="text-gray-500">{'->'}</span>
                  </>
                ) : data.changed.newValue ? (
                  <>Added</>
                ) : (
                  <>Removed</>
                )}

                {data.changed.newValue ? (
                  <>
                    <span className="text-green-500 max-w-[200px] truncate">
                      {data.changed.newValue?.toString() || 'null'}
                    </span>
                  </>
                ) : null}
              </div>
            );
          }
        },
      },
    },
    changeType: {
      component: {
        detailValue: ({ data }) => {
          const type = data.changed.type === 'created' ? 'insert' : 'update';
          const colorClass = colorMap[type] || 'bg-gray-100 text-gray-700';

          return (
            <div
              className={`flex mr-2 flex-row items-center gap-2 px-3 py-1 border border-gray-300 rounded-md shadow-sm ${colorClass}`}
            >
              <span className="font-semibold text-xs h-7 grid place-items-center w-10">
                {t(`history.${type}`)}
              </span>
            </div>
          );
        },
        list: ({ data }) => {
          const type = data.changed.type === 'created' ? 'insert' : 'update';
          const colorClass = colorMap[type] || 'bg-gray-100 text-gray-700';

          return (
            <div
              className={`flex mr-2 flex-row items-center gap-2 px-3 py-1 border border-gray-300 rounded-md shadow-sm ${colorClass}`}
            >
              <span className="font-semibold text-xs h-7 grid place-items-center w-10">
                {t(`history.${type}`)}
              </span>
            </div>
          );
        },
      },
    },
  },
});

const PrettyJson = ({ record }: HistoryViewDataType) => {
  if (!record) return null;

  const renderValue = (value: any): React.ReactNode => {
    if (value === null) return <span className="text-gray-500">null</span>;
    if (value === undefined)
      return <span className="text-gray-500">undefined</span>;
    if (typeof value === 'boolean')
      return <span className="text-purple-600">{value.toString()}</span>;
    if (typeof value === 'number')
      return <span className="text-green-600">{value}</span>;
    if (typeof value === 'string')
      return <span className="text-amber-600">"{value}"</span>;
    if (Array.isArray(value)) {
      return (
        <div className="pl-4">
          <span className="text-gray-600">[</span>
          <div className="pl-4">
            {value.map((item, i) => (
              <div key={i} className="flex">
                {renderValue(item)}
                {i < value.length - 1 && (
                  <span className="text-gray-600">,</span>
                )}
              </div>
            ))}
          </div>
          <span className="text-gray-600">]</span>
        </div>
      );
    }
    if (typeof value === 'object') {
      return (
        <div className="pl-4">
          <span className="text-gray-600">{'{'}</span>
          <div className="pl-4">
            {Object.entries(value).map(([key, val], i, arr) => (
              <div key={key} className="flex">
                <span className="text-blue-600 font-medium">{key}</span>
                <span className="text-gray-600">: </span>
                {renderValue(val)}
                {i < arr.length - 1 && <span className="text-gray-600">,</span>}
              </div>
            ))}
          </div>
          <span className="text-gray-600">{'}'}</span>
        </div>
      );
    }
    return <span>{String(value)}</span>;
  };

  return (
    <div className="font-mono text-sm bg-background w-full p-4 rounded-lg border border-gray-200 overflow-auto max-h-[500px]">
      {renderValue(record)}
    </div>
  );
};

// Add this component to display field updates nicely
const PrettyUpdateChange = ({
  change: changed,
}: {
  change: HistoryViewDataType['changed'];
}) => {
  const field = changed.fieldName;
  const { t } = useTranslation();

  // Get the translated field name if available
  const fieldLabel = t(`${field}.one` as any, { defaultValue: field });

  // const isPrimitive = (val: any) => {
  //   return (
  //     val === null ||
  //     val === undefined ||
  //     typeof val !== 'object' ||
  //     (Array.isArray(val) &&
  //       val.every((item) => typeof item !== 'object' || item === null))
  //   );
  // };

  if (
    changed.type === 'changed' ||
    changed.type === 'added-to' ||
    changed.type === 'removed-from'
  ) {
    return (
      <div className="bg-white rounded-lg border border-foreground/10 p-4 text-sm">
        <div className="font-medium text-gray-700 mb-2">
          <span>Field: </span>
          <span className="font-mono underline-offset-1 underline">
            {fieldLabel}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-red-600 min-w-10">
              Old:
            </span>
            <span className="bg-red-50 text-red-800 p-2 rounded border border-red-200 line-through">
              {changed.oldValue === '' ? (
                <em className="text-red-400">empty</em>
              ) : (
                <>{changed.oldValue}</>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-green-600 min-w-10">
              New:
            </span>
            <span className="bg-green-50 text-green-800 p-2 rounded border border-green-200">
              {changed.newValue === '' ? (
                <em className="text-green-400">empty</em>
              ) : (
                <>{changed.newValue}</>
              )}
            </span>
          </div>
        </div>
      </div>
    );
  } else if (changed.type === 'added' || changed.type === 'removed') {
    const label = changed.label;
    const fieldName = changed.fieldName;
    const color = changed.type === 'added' ? 'text-green-500' : 'text-red-500';

    return (
      <div className="flex flex-row text-xs items-center gap-2 py-1 rounded-md shadow-sm">
        <span className={color}>
          {changed.type === 'added' ? 'Added' : 'Removed'}
        </span>

        <span className="font-medium text-gray-700 px-2 py-1 border-foreground/30 border-[1px] rounded-md">
          {t(`${fieldName}.one` as any)}
        </span>

        <span className={cn('text-foreground font-bold', color)}>{label}</span>
      </div>
    );
  }

  // // For complex objects, show the full object for both old and new
  // return (
  //   <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
  //     <div className="font-medium text-gray-700 mb-2">{fieldLabel}</div>
  //     <div className="flex flex-col gap-4">
  //       <div>
  //         <div className="text-sm text-red-600 font-medium mb-1">
  //           Old Value:
  //         </div>
  //         <div className="bg-red-50 border border-red-200 rounded-md p-2">
  //           <PrettyJson data={oldValue} />
  //         </div>
  //       </div>
  //       <div>
  //         <div className="text-sm text-green-600 font-medium mb-1">
  //           New Value:
  //         </div>
  //         <div className="bg-green-50 border border-green-200 rounded-md p-2">
  //           <PrettyJson data={newValue} />
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
};

const HistoryMainPage = observer(() => {
  return (
    <DefaultViewTemplate<HistoryViewDataType>
      filterOptions={{ hideFields: ['changeType', 'change'] }}
      listOptions={{
        fieldsLeft: ['changeType', 'tableName'],
        fieldsRight: ['change', 'owner'],
        onClickRelation(field, row, cb) {
          if (field.name === 'tableName' || field.name === 'changeType') {
            return;
          }

          cb();
        },
      }}
    />
  );
});

const HistoryDetailPage = observer(() => {
  return (
    <>
      <DefaultDetailViewTemplate
        detailOptions={{
          onClickRelation(field, row, cb) {
            if (field.name === 'tableName' || field.name === 'changeType') {
              return;
            }

            if (field.name === 'entityId' || field.name === 'owner') {
              const fieldName = field.name === 'entityId' ? 'id' : field.name;

              store$.navigation.state.set({
                type: 'navigate',
                view: field.name === 'entityId' ? row.raw.tableName : fieldName,
                id:
                  field.name === 'entityId'
                    ? row.raw[field.name]
                    : row.raw?.[fieldName]._id,
              });
            } else {
              cb();
            }
          },
        }}
      />
    </>
  );
});

const HistoryOverviewPage = observer(() => {
  const { t } = useTranslation();
  const { makeDetailPageProps } = makeHooks<HistoryViewDataType>();
  const props = makeDetailPageProps({});

  const row = store$.detail.row.get() as Row<HistoryViewDataType>;

  const isInsert = row.raw.changed.type === 'created';
  const headerLabel = isInsert
    ? t('history.detail.headerInsert')
    : t('history.detail.headerUpdate');

  const changeType = row.raw.changed.type;
  const isValueChange =
    changeType === 'changed' ||
    changeType === 'added-to' ||
    changeType === 'removed-from' ||
    changeType === 'added' ||
    changeType === 'removed';
  return (
    <div data-testid="detail-form" className="pt-12">
      <div className="pl-20">
        <div className="pb-6 flex items-center gap-4">
          <detailPage.icon {...props} />
        </div>

        <h2 className="text-base font-semibold text-gray-800  flex flex-row gap-2 items-center">
          <span>{headerLabel}</span>

          <button
            onClick={() => {
              store$.navigation.state.set({
                type: 'navigate',
                view: row.raw.tableName,
                id: row.raw.entityId,
              });
            }}
          >
            <BubbleItem
              label={row.raw.recordLabel ?? ''}
              icon={getView(row.raw.tableName)?.icon}
            />
          </button>
        </h2>

        <div
          className={cn(
            'mt-4 p-3 rounded-md mr-4',
            colorMap[row.raw.changeType]
          )}
        >
          {/* TODO use the HistoryChangeRenderer for this whole view */}
          {isInsert ? (
            <>
              <PrettyJson {...row.raw} />
            </>
          ) : isValueChange ? (
            <div className="space-y-0">
              <PrettyUpdateChange change={row.raw.changed} />
            </div>
          ) : (
            <div className="bg-red-50 text-red-800 p-4 rounded border border-red-200">
              <div className="font-medium mb-2">Deleted Data</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

viewRegistry
  .addView(historyConfig)
  .addComponents({
    main: HistoryMainPage,
    detail: HistoryDetailPage,
    overView: HistoryOverviewPage,
  })
  .addUiConfig(uiViewConfig);
