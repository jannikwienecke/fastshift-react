import { CommandbarItem, getViewLabel, t } from '@apps-next/core';
import { BubbleItem } from '@apps-next/ui';
import { ArrowRightIcon } from 'lucide-react';
import { getView, store$, viewRegistry } from '../legend-store';
import { getViewName } from './commands.helper';

export const makeGlobalQueryCommands = () => {
  const result = store$.globalQueryData.get();

  if (store$.commandsDisplay.type.get()) return [];

  const commands = Object.entries(result ?? {})
    .map(([table, records]) => {
      if (!records) return null;
      const view = getView(table);
      return records
        .map((record) => {
          const goToCommands: CommandbarItem = {
            id: `global-query-${table}-${record.id}`,
            command: 'global-query-commands',
            label: record.label,

            header: () =>
              t('__commands.headers.global-query', {
                query: store$.globalQueryDebounced.get(),
              }),
            getViewName,
            handler: () => {
              store$.navigation.state.set({
                view: table,
                id: record.id,
                type: 'navigate',
              });
            },
            render: () => {
              if (!view) return null;

              const uiViewConfig =
                viewRegistry.getView(view.viewName).uiViewConfig ?? {};
              const renderCommandbarRow =
                uiViewConfig[view.tableName]?.renderCommandbarRow;

              const tableLabel = getViewLabel(view, true);

              if (renderCommandbarRow) {
                return (
                  <div className="flex flex-row items-center gap-2">
                    <BubbleItem label={tableLabel} icon={view.icon} />
                    <div>{renderCommandbarRow({ row: record })}</div>

                    <div className="flex-grow" />
                    <ArrowRightIcon className="text-foreground/50 mr-2" />
                  </div>
                );
              }

              return (
                <div className="flex items-center gap-3" key={record.id}>
                  <BubbleItem label={tableLabel} icon={view.icon} />

                  <div className="flex flex-row items-center gap-1">
                    <>{record.label}</>
                  </div>
                </div>
              );
            },
          };

          return goToCommands;
        })
        .filter((cmd) => cmd !== null)
        .flat();
    })
    .flat();

  return commands.filter((cmd) => cmd !== null) satisfies CommandbarItem[];
};
