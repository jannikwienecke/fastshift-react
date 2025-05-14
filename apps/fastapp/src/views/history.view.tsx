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
                  id: data.entityId,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-sm flex flex-row gap-2 items-center cursor-pointer hover:underline hover:text-blue-400"
              >
                <div>{data.label}</div>
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
              label={data.owner?.name ?? 'Set User Email'}
              icon={() => <ownerConfig.icon className="w-4 h-4" />}
            />
          );
        },
        list: ({ data }) => {
          return (
            <BubbleItem
              label={data.owner?.name ?? 'Set User Email'}
              icon={() => <ownerConfig.icon className="w-4 h-4" />}
            />
          );
        },
      },
    },
    change: {
      component: {
        list: ({ data }) => {
          const change = data.change;

          const newData = change.newValue;
          const oldData = change.oldValue;

          const newIsObject = typeof newData === 'object';
          const oldIsObject = typeof oldData === 'object';

          if (
            (newIsObject && newData !== null) ||
            (oldIsObject && oldData !== null)
          ) {
            return null;
          }

          if (data.parsedChange?.isManyToMany) {
            const label =
              data.parsedChange?.modelLabel?.toLowerCase() || change.field;
            const color = newData ? 'text-green-500' : 'text-red-500';
            return (
              <div className="flex flex-row text-xs items-center gap-2 py-1 px-2 bg-foreground/10 border border-gray-300 rounded-md shadow-sm">
                <div className={color}>{newData ? 'Added' : 'Removed'}</div>

                <span className="font-medium text-gray-700 px-2 py-1 border-foreground/30 border-[1px] rounded-md">
                  {t(`${label}.one` as any)}
                </span>

                <span className={cn('text-foreground font-bold', color)}>
                  {data.parsedChange?.newLabel}
                </span>
              </div>
            );
          }

          return (
            <div className="flex flex-row text-xs items-center gap-2 py-1 px-2 bg-foreground/10 border border-gray-300 rounded-md shadow-sm">
              <span className="font-medium text-gray-700">
                {data.parsedChange?.modelLabel || change.field}
              </span>
              <span className="text-foreground/80">:</span>
              <span className="text-red-400 line-through max-w-[200px] truncate ">
                {data.parsedChange?.oldLabel ?? change?.oldValue}
              </span>
              <span className="text-gray-500">{'->'}</span>
              <span className="text-green-500 max-w-[200px] truncate">
                {data.parsedChange?.newLabel ?? change?.newValue}
              </span>
            </div>
          );
        },
      },
    },
    changeType: {
      component: {
        detailValue: ({ data }) => {
          const colorClass =
            colorMap[data.changeType] || 'bg-gray-100 text-gray-700';

          return (
            <div
              className={`flex mr-2 flex-row items-center gap-2 px-3 py-1 border border-gray-300 rounded-md shadow-sm ${colorClass}`}
            >
              <span className="font-semibold text-xs h-7 grid place-items-center w-10">
                {t(`history.${data.changeType}`)}
              </span>
            </div>
          );
        },
        list: ({ data }) => {
          const colorClass =
            colorMap[data.changeType] || 'bg-gray-100 text-gray-700';

          return (
            <div
              className={`flex mr-2 flex-row items-center gap-2 px-3 py-1 border border-gray-300 rounded-md shadow-sm ${colorClass}`}
            >
              <span className="font-semibold text-xs h-7 grid place-items-center w-10">
                {t(`history.${data.changeType}`)}
              </span>
            </div>
          );
        },
      },
    },
  },
});

const PrettyJson = ({ data }: { data: any }) => {
  if (!data) return null;

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
      {renderValue(data)}
    </div>
  );
};

// Add this component to display field updates nicely
const PrettyUpdateChange = ({
  change,
  parsedChange,
}: {
  change: HistoryViewDataType['change'];
  parsedChange: HistoryViewDataType['parsedChange'];
}) => {
  const { field, oldValue, newValue } = change;
  const { t } = useTranslation();

  // Get the translated field name if available
  const fieldLabel = t(`${field}.one` as any, { defaultValue: field });

  // Function to determine if the value is a primitive or complex type
  const isPrimitive = (val: any) => {
    return (
      val === null ||
      val === undefined ||
      typeof val !== 'object' ||
      (Array.isArray(val) &&
        val.every((item) => typeof item !== 'object' || item === null))
    );
  };

  // For primitive values, show a direct comparison
  if (isPrimitive(oldValue) && isPrimitive(newValue)) {
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
              {oldValue === '' ? (
                <em className="text-red-400">empty</em>
              ) : (
                <>
                  {parsedChange.newLabel && oldValue
                    ? parsedChange.newLabel ?? String(oldValue)
                    : String(oldValue)}
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-green-600 min-w-10">
              New:
            </span>
            <span className="bg-green-50 text-green-800 p-2 rounded border border-green-200">
              {newValue === '' ? (
                <em className="text-green-400">empty</em>
              ) : (
                <>
                  {parsedChange.newLabel && newValue
                    ? parsedChange.newLabel ?? String(newValue)
                    : String(newValue)}
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // For complex objects, show the full object for both old and new
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <div className="font-medium text-gray-700 mb-2">{fieldLabel}</div>
      <div className="flex flex-col gap-4">
        <div>
          <div className="text-sm text-red-600 font-medium mb-1">
            Old Value:
          </div>
          <div className="bg-red-50 border border-red-200 rounded-md p-2">
            <PrettyJson data={oldValue} />
          </div>
        </div>
        <div>
          <div className="text-sm text-green-600 font-medium mb-1">
            New Value:
          </div>
          <div className="bg-green-50 border border-green-200 rounded-md p-2">
            <PrettyJson data={newValue} />
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoryMainPage = observer(() => {
  return (
    <DefaultViewTemplate<HistoryViewDataType>
      filterOptions={{ hideFields: ['changeType', 'change'] }}
      listOptions={{
        fieldsLeft: ['changeType', 'tableName'],
        fieldsRight: ['change', 'owner'],
        onClickRelation(field, row, cb) {
          if (field.name === 'users') {
            store$.navigation.state.set({
              type: 'navigate',
              view: 'owner',
              id: row.raw?.['owner']._id,
            });
          } else {
            cb();
          }
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
            const fieldName =
              field.name === 'entityId'
                ? 'id'
                : field.name === 'users'
                ? 'owner'
                : field.name;

            store$.navigation.state.set({
              type: 'navigate',
              view: field.name === 'entityId' ? row.raw.tableName : fieldName,
              id:
                field.name === 'entityId'
                  ? row.raw[field.name]
                  : row.raw?.[fieldName]._id,
            });
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

  const isInsert = row.raw.changeType === 'insert';
  const headerLabel =
    row.raw.changeType === 'insert'
      ? t('history.detail.headerInsert')
      : t('history.detail.headerUpdate');

  console.log('row', row);

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
              label={row.raw.label ?? ''}
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
          {isInsert ? (
            <>
              <PrettyJson data={row.raw.change.newValue} />
            </>
          ) : row.raw.changeType === 'update' ? (
            <div className="space-y-0">
              <PrettyUpdateChange
                change={row.raw.change}
                parsedChange={row.raw.parsedChange}
              />
            </div>
          ) : (
            <div className="bg-red-50 text-red-800 p-4 rounded border border-red-200">
              <div className="font-medium mb-2">Deleted Data</div>
              <PrettyJson data={row.raw.change.oldValue} />
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
