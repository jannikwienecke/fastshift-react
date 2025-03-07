import {
  DisplayOptionsProps,
  TranslationKeys,
  useTranslation,
} from '@apps-next/core';
import {
  ArrowUpDownIcon,
  ChevronDownIcon,
  GridIcon,
  ListIcon,
  SlidersHorizontalIcon,
  StretchHorizontalIcon,
} from 'lucide-react';
import { Button } from '../components';

import { Popover, PopoverContent, PopoverTrigger } from '../components';
import { cn } from '../utils';
import { Bubble } from '../bubble';

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
      className="py-0 h-7 max-w-fit flex flex-row items-center gap-2 text-xs"
      onClick={props.onClick}
    >
      <div>{t(props.label as TranslationKeys)}</div>

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
  return (
    <div className="flex flex-row gap-2 items-center justify-between">
      <div className="flex flex-row gap-2 items-center">
        <ArrowUpDownIcon className="w-3 h-3" strokeWidth={3} />
        <span className="text-foreground/70">
          {props.sorting.label || t('displayOptions.sorting.label')}
        </span>
      </div>

      <div className="flex flex-row gap-2 items-center">
        <DisplayOptionsSelectButton
          label={props.sorting.field?.name.firstUpper() ?? ''}
          onClick={(e) => {
            props.sorting.onOpen(e.currentTarget.getBoundingClientRect());
          }}
        />
      </div>
    </div>
  );
};

const DisplayOptionsGroupingButtonCombobox = (props: {
  grouping: DisplayOptionsProps['grouping'];
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row gap-2 items-center justify-between">
      <div className="flex flex-row gap-2 items-center">
        <StretchHorizontalIcon className="w-3 h-3" strokeWidth={3} />

        <span className="text-foreground/70">
          {props.grouping.label || t('displayOptions.grouping.label')}
        </span>
      </div>

      <div className="flex flex-row gap-2 items-center">
        <DisplayOptionsSelectButton
          label={props.grouping.field?.name.firstUpper() ?? ''}
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
  return (
    <div>
      <div className="text-foreground/70">Display Properties</div>
      <div className="flex flex-row flex-wrap gap-2 pt-2">
        {props.viewFields.map((field) => (
          <div
            key={field.id.toString()}
            className="flex flex-row items-center justify-between"
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
              {field.label.firstUpper()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DisplayOptionsPopover(props: {
  isOpen: DisplayOptionsProps['isOpen'];
  onClose: DisplayOptionsProps['onClose'];
  children: React.ReactNode;
  sorting: DisplayOptionsProps['sorting'];
  grouping: DisplayOptionsProps['grouping'];
  viewType: DisplayOptionsProps['viewType'];
  viewFields: DisplayOptionsProps['viewFields'];
  onSelectViewField: DisplayOptionsProps['onSelectViewField'];
}) {
  return (
    <Popover modal onOpenChange={(open) => !open && props.onClose()}>
      <PopoverTrigger asChild>
        <button className="h-7">{props.children}</button>
      </PopoverTrigger>

      <PopoverContent
        className="max-w-72 w-72 min-w-72 flex flex-col gap-2 p-4 mr-8 text-[12px]"
        sideOffset={15}
        side="bottom"
      >
        <DisplayOptionsViewType {...props} />

        <DisplayOptionsOrderingButtonCombobox {...props} />
        <DisplayOptionsGroupingButtonCombobox {...props} />

        <DisplayOptionsRenderFields {...props} />
      </PopoverContent>
    </Popover>
  );
}

export const DisplayOptions = {
  Default: DisplayOptionsDefault,
};
