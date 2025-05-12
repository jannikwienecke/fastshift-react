import { historyConfig, Users, usersConfig } from '@apps-next/convex';
import { DataType, getViewByName, RecordType } from '@apps-next/core';
import { getView, makeViewFieldsConfig, viewRegistry } from '@apps-next/react';
import { BubbleItem } from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import { DefaultViewTemplate } from './default-view-template';

type HistoryViewDataType = DataType<
  'history',
  {
    users?: Users;
    record?: RecordType;
    label?: string;
    parsedChange?: {
      oldRecord?: RecordType;
      newRecord?: RecordType;
      oldLabel?: string;
      newLabel?: string;
      modelLabel?: string;
    };
  }
>;

const uiViewConfig = makeViewFieldsConfig<HistoryViewDataType>('history', {
  fields: {
    tableName: {
      component: {
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
                <div>{data.tableName}</div>
              </div>
              <div className="text-sm">{data.label}</div>
            </div>
          );
        },
      },
    },
    users: {
      component: {
        list: ({ data }) => {
          return (
            <BubbleItem
              label={data.users?.email ?? 'Set User Email'}
              icon={() => <usersConfig.icon className="w-4 h-4" />}
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

          if (newIsObject || oldIsObject) {
            // render as JSON
            return (
              <div className="flex flex-row text-xs items-center gap-2 py-1 px-2 bg-foreground/10 border border-gray-300 rounded-md shadow-sm">
                <span className="font-medium text-gray-700">
                  {data.parsedChange?.modelLabel || change.field}
                </span>
                <span className="text-foreground/80">:</span>
                <span className="text-gray-500">
                  {JSON.stringify(change, null, 2)}
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
              <span className="text-red-400 line-through">
                {data.parsedChange?.oldLabel ?? change?.oldValue}
              </span>
              <span className="text-gray-500">{'->'}</span>
              <span className="text-green-500">
                {data.parsedChange?.newLabel ?? change?.newValue}
              </span>
            </div>
          );
        },
      },
    },
    changeType: {
      component: {
        list: ({ data }) => {
          const colorMap: Record<string, string> = {
            insert: 'bg-green-100 text-green-700 border-green-300',
            update: 'bg-yellow-100 text-yellow-700 border-yellow-300',
            delete: 'bg-red-100 text-red-700 border-red-300',
          };
          const colorClass =
            colorMap[data.changeType] || 'bg-gray-100 text-gray-700';
          return (
            <div
              className={`flex flex-row items-center gap-2 px-3 py-1 border border-gray-300 rounded-md shadow-sm ${colorClass}`}
            >
              <span className="font-semibold text-xs">{data.changeType}</span>
            </div>
          );
        },
      },
    },
  },
});

const HistoryMainPage = observer(() => {
  return (
    <DefaultViewTemplate<HistoryViewDataType>
      listOptions={{
        fieldsLeft: ['changeType', 'tableName'],
        fieldsRight: ['change', 'users'],
      }}
    />
  );
});

viewRegistry
  .addView(historyConfig)
  .addComponents({ main: HistoryMainPage })
  .addUiConfig(uiViewConfig);
