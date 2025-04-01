import {
  DisplayOptionsProps,
  NO_SORTING_FIELD,
  renderModelName,
  translateField,
  TranslationKeys,
  useTranslation,
} from '@apps-next/core';
import {
  ArrowDownWideNarrowIcon,
  ArrowUpDownIcon,
  ArrowUpWideNarrowIcon,
  ChevronDownIcon,
  GridIcon,
  ListIcon,
  SlidersHorizontalIcon,
  StretchHorizontalIcon,
} from 'lucide-react';
import { Button, Switch } from '../components';

import { Popover, PopoverContent, PopoverTrigger } from '../components';
import { SelectSeparator } from '../components/select';
import { cn } from '../utils';

const DisplayOptionsDefault = (props: DisplayOptionsProps) => {
  return (
    <>
      <DisplayOptionsPopover {...props}>
        <DisplayOptionsButton {...props} />
      </DisplayOptionsPopover>
    </>
  );
};

const DisplayOptionsButton = (props: {
  label: DisplayOptionsProps['label'];
  onOpen: DisplayOptionsProps['onOpen'];
}) => {
  const { t } = useTranslation();
  return (
    <span
      // variant={'outline'}
      className="justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 py-0 h-7 px-4 flex flex-row items-center gap-2 text-xs border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
      onClick={(e) => {
        props.onOpen(e.currentTarget.getBoundingClientRect());
      }}
      data-testid="display-options-button"
    >
      <div>
        <SlidersHorizontalIcon className="w-4 h-4" />
      </div>

      <div>{t(props.label as TranslationKeys)}</div>
    </span>
  );
};

const DisplayOptionsSelectButton = (props: {
  label: DisplayOptionsProps['label'];
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const { t } = useTranslation();
  return (
    <Button
      variant={'outline'}
      className="py-0 h-7 px-1 flex flex-row items-center gap-1 text-xs flex-grow justify-between"
      onClick={props.onClick}
    >
      <div>
        {props.label.includes('displayOptions.')
          ? t(props.label as TranslationKeys)
          : renderModelName(props.label, t).firstUpper()}
      </div>

      <div>
        <ChevronDownIcon className="w-4 h-4" />
      </div>
    </Button>
  );
};

const DisplayOptionsOrderingButtonCombobox = (props: {
  sorting: DisplayOptionsProps['sorting'];
}) => {
  const { t } = useTranslation();

  const SortingIcon =
    props.sorting.order === 'asc'
      ? ArrowUpWideNarrowIcon
      : ArrowDownWideNarrowIcon;

  return (
    <div className="flex flex-row gap-2 items-center justify-between w-full">
      <div className="flex flex-row gap-2 items-center">
        <ArrowUpDownIcon className="w-3 h-3" strokeWidth={3} />
        <span className="text-foreground/70">
          {props.sorting.label
            ? t(props.sorting.label as any)
            : t('displayOptions.sorting.label')}
        </span>
      </div>

      <div className="flex flex-row gap-2 justify-end items-center w-44 overflow-hidden">
        <DisplayOptionsSelectButton
          label={props.sorting.field?.name ?? ''}
          onClick={(e) => {
            props.sorting.onOpen(e.currentTarget.getBoundingClientRect());
          }}
        />

        {props.sorting.field?.name !== NO_SORTING_FIELD.name ? (
          <Button
            onClick={() => props.sorting.toggleSorting()}
            variant={'outline'}
            className="h-7 w-7 p-0"
            aria-label="toggle-sorting-direction"
          >
            <SortingIcon className="min-w-5 h-[17px]" strokeWidth={2} />
          </Button>
        ) : null}
      </div>
    </div>
  );
};

const DisplayOptionsGroupingButtonCombobox = (props: {
  grouping: DisplayOptionsProps['grouping'];
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row gap-2 items-center justify-between w-full">
      <div className="flex flex-row gap-2 items-center">
        <StretchHorizontalIcon className="w-3 h-3" strokeWidth={3} />

        <span className="text-foreground/70">
          {props.grouping.label || t('displayOptions.grouping.label')}
        </span>
      </div>

      <div className="flex flex-row items-center w-44 overflow-hidden">
        <DisplayOptionsSelectButton
          label={props.grouping.field?.name ?? ''}
          onClick={(e) => {
            props.grouping.onOpen(e.currentTarget.getBoundingClientRect());
          }}
        />
      </div>
    </div>
  );
};

function DisplayOptionsViewType({
  viewType,
}: {
  viewType: DisplayOptionsProps['viewType'];
}) {
  return (
    <div className="flex flex-row items-center space-x-2">
      <Button
        variant="outline"
        className={cn(
          'flex flex-col space-y-0 w-full h-11',
          viewType.type === 'list' && 'bg-accent text-accent-foreground'
        )}
      >
        <div>
          <ListIcon className="w-4 h-4" />
        </div>
        <div className="text-[11px]">List</div>
      </Button>

      <Button
        variant="outline"
        className={cn(
          'flex flex-col space-y-0 w-full h-11',
          viewType.type === 'board' && 'bg-accent text-accent-foreground'
        )}
      >
        <div>
          <GridIcon className="w-4 h-4" />
        </div>
        <div className="text-[11px]">Board</div>
      </Button>
    </div>
  );
}

function DisplayOptionsRenderFields(props: {
  viewFields: DisplayOptionsProps['viewFields'];
  onSelectViewField: DisplayOptionsProps['onSelectViewField'];
}) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="text-foreground/70">Display Properties</div>
      <div className="flex flex-row flex-wrap gap-2 pt-2">
        {props.viewFields.map((field) => {
          return (
            <div
              role="button"
              key={field.id.toString()}
              className="flex flex-row items-center justify-between cursor-pointer"
              onClick={() => props.onSelectViewField(field)}
            >
              <div
                className={cn(
                  'rounded-lg border px-2',
                  field.selected
                    ? 'border'
                    : 'border-transparent text-foreground/70'
                )}
              >
                {translateField(t, field)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DisplayOptionsPopover(
  props: DisplayOptionsProps & {
    children: React.ReactNode;
  }
) {
  const { t } = useTranslation();

  return (
    <Popover
      modal
      open={props.isOpen}
      onOpenChange={(open) => !open && props.onClose()}
    >
      <PopoverTrigger asChild>
        <button className="h-7">{props.children}</button>
      </PopoverTrigger>

      <PopoverContent
        className="max-w-80 w-80 min-w-80 flex flex-col gap-2 p-4 mr-8 text-[12px]"
        sideOffset={15}
        side="bottom"
        data-testid="display-options"
      >
        <DisplayOptionsViewType {...props} />
        <DisplayOptionsOrderingButtonCombobox {...props} />
        <DisplayOptionsGroupingButtonCombobox {...props} />
        <SelectSeparator />
        <div>{t('displayOptions.listOptions')}</div>
        {props.showEmptyGroupsToggle ? (
          <div className="flex flex-row items-center justify-between">
            <div className="text-foreground/70 flex items-center">
              {t('displayOptions.showEmptyGroups')}
            </div>

            <Switch
              onCheckedChange={props.onToggleShowEmptyGroups}
              checked={props.showEmptyGroups}
            />
          </div>
        ) : null}
        {props.softDeleteEnabled ? (
          <div className="flex flex-row items-center justify-between">
            <div className="text-foreground/70 flex items-center">
              {t('displayOptions.showDeleted')}
            </div>

            <Switch
              onCheckedChange={props.onToggleShowDeleted}
              checked={props.showDeleted}
            />
          </div>
        ) : null}
        <DisplayOptionsRenderFields {...props} />
        {props.showResetButton ? (
          <>
            <SelectSeparator className="mb-0 pb-0" />

            <div className="flex flex-row justify-end text-xs">
              <Button
                onClick={props.onReset}
                variant={'ghost'}
                size={'sm'}
                className="text-xs"
              >
                {t('displayOptions.clearAll')}
              </Button>
            </div>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export const DisplayOptions = {
  Default: DisplayOptionsDefault,
};
