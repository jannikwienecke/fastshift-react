import {
  CommandbarProps,
  MakeCommandbarPropsOption,
  makeRow,
  RecordType,
} from '@apps-next/core';

import { CarIcon, PencilIcon, PencilLineIcon } from 'lucide-react';
import { store$ } from '../legend-store';
import {
  commandbarProps$,
  derivedCommandbarState$,
} from '../legend-store/legend.commandbar.derived';
import { getComponent } from '../ui-components/ui-components.helper';
import { Icon } from '../ui-components';

export const makeCommandbarProps = <T extends RecordType>(
  options?: MakeCommandbarPropsOption<T>
): CommandbarProps => {
  commandbarProps$.set(options ?? {});

  const state = derivedCommandbarState$.get();

  return {
    ...state,
    renderItem(item) {
      try {
        const field = store$.viewConfigManager.getFieldBy(item.id.toString());

        const row = makeRow(item.id.toString(), item.label, item, field);
        const Component = getComponent({
          fieldName: field?.name,
          componentType: 'commandbarFieldItem',
        });

        if (!Component) {
          const IconOf = getComponent({
            fieldName: field?.name,
            componentType: 'icon',
          });

          return (
            <div className="flex flex-row gap-4 items-center">
              <div className=" text-foreground/50">
                {IconOf ? (
                  <Icon icon={IconOf} />
                ) : (
                  <Icon icon={PencilLineIcon} />
                )}
              </div>

              <div>{row.label}</div>
            </div>
          );
        }

        return (
          <Component
            value={row}
            componentType={'commandbarFieldItem'}
            field={field}
          />
        );
      } catch (e) {
        console.error('Error rendering commandbar item', e);
        return (
          <div className="flex flex-row gap-2 items-center">
            NOTHING HERE YET
          </div>
        );
      }
    },
  };
};
