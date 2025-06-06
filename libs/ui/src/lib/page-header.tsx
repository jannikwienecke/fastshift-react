import {
  getFieldLabel,
  PageHeaderProps,
  useTranslation,
} from '@apps-next/core';
import {
  ChevronsUpDown,
  Layers3Icon,
  PanelRightIcon,
  SearchIcon,
  StarIcon,
} from 'lucide-react';
import { CommandsDropdown } from './commands-dropdown';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  SearchInput,
} from './components';
import { StarredIcon } from './starred-icon';
import { cn } from './utils';

const DefaultPageHeaderMain = (props: PageHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div
      data-testid="main-page-header"
      className="flex flex-row items-center justify-between w-full"
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="text-[13px]">
            {/* FIXME translation */}
            <BreadcrumbLink href="/components">Views</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          <BreadcrumbItem className="text-[13px]">
            <BreadcrumbPage className="flex flex-row gap-4 items-center">
              <div className="flex flex-row gap-2 items-center">
                <div>
                  {props.emoji?.emoji ? (
                    <>{props.emoji.emoji}</>
                  ) : (
                    <>
                      {props.icon ? <props.icon className="w-4 h-4" /> : null}
                    </>
                  )}
                </div>
                {props.viewName}
              </div>

              <CommandsDropdown {...props.commandsDropdownProps} />

              <StarredIcon {...props} />
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div data-testid="right-header-actions" className="pr-4">
        {props.query?.showInput ? (
          <SearchInput
            onChange={(e) => {
              props.query?.onChange(e.target.value);
            }}
            autoFocus
            placeholder="Find in view..."
            onBlur={props.query.onBlur}
          />
        ) : (
          <div className="flex flex-row gap-0 items-center">
            <div className="pr-4 flex flex-row gap-2 items-center">
              {props.commands?.primaryCommand ? (
                <Button
                  variant={'ghost'}
                  className="text-xs flex flex-row items-center gap-1"
                  size={'sm'}
                  onClick={() =>
                    props.commands.primaryCommand &&
                    props.commands.commandsDropdownProps?.onSelectCommand?.(
                      props.commands.primaryCommand
                    )
                  }
                >
                  {props.commands.primaryCommand.icon ? (
                    <props.commands.primaryCommand.icon className="h-4 w-4" />
                  ) : null}
                  <div>{props.commands.primaryCommand.label}</div>
                </Button>
              ) : null}

              {props.commands?.commandsDropdownProps?.commands.length ? (
                <CommandsDropdown {...props.commands.commandsDropdownProps}>
                  <div
                    className="flex flex-row items-center gap-1"
                    onClick={(e) => {
                      props.commands.commandsDropdownProps?.onOpenCommands?.(
                        true
                      );
                    }}
                  >
                    <div className="text-xs">Commands</div>
                    <ChevronsUpDown className="size-4" />
                  </div>
                </CommandsDropdown>
              ) : null}
            </div>

            <Button
              variant={'ghost'}
              size="icon"
              onClick={props.query?.toggleShowInput}
            >
              <SearchIcon className="h-4 w-4" />
            </Button>

            {props.query?.onToggleRightSidebar ? (
              <Button
                variant={'ghost'}
                size="icon"
                onClick={props.query?.onToggleRightSidebar}
              >
                <PanelRightIcon className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

const DefaultPageHeaderDetail = (props: PageHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div
      data-testid="detail-page-header"
      className="flex flex-row items-center justify-between"
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="text-sm">
            <BreadcrumbLink href="/components">
              <Layers3Icon className="h-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem className="text-sm">
            <BreadcrumbLink
              className="cursor-pointer"
              onClick={() => props.detail?.onClickParentView()}
            >
              <div className="flex flex-row gap-2 items-center">
                <div>
                  {props.emoji?.emoji ? (
                    <>{props.emoji.emoji}</>
                  ) : (
                    <>
                      {props.icon ? <props.icon className="w-4 h-4" /> : null}
                    </>
                  )}
                </div>
                {props.viewName}
              </div>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          <BreadcrumbItem className="text-sm">
            <BreadcrumbPage className="flex flex-row gap-4 items-center">
              <div className="flex flex-row gap-2 items-center">
                {props.detail?.label ?? ''}
              </div>

              <CommandsDropdown {...props.commandsDropdownProps} />

              <StarIcon
                data-testid={props.starred ? 'starred' : 'unstarred'}
                className={cn(
                  'h-4 w-4 cursor-pointer',
                  props.starred ? 'text-yellow-500' : 'text-foreground'
                )}
                onClick={() => {
                  props.onToggleFavorite?.();
                }}
              />

              <div className="flex flex-row gap-2">
                <Button
                  onClick={() =>
                    props.detail?.onSelectView({ type: 'overview' })
                  }
                  variant={
                    props.detail?.viewTypeState.type === 'overview'
                      ? 'outline'
                      : 'ghost'
                  }
                  className=""
                  size="sm"
                >
                  {t('common.overview')}
                </Button>

                {props.detail?.relationalListFields.map((field) => {
                  const model =
                    props.detail?.viewTypeState.type === 'model'
                      ? props.detail.viewTypeState.model
                      : '';
                  const isActive = model === field.field?.name;
                  if (!field.field) return null;
                  return (
                    <Button
                      onMouseOver={() => {
                        props.detail?.onHoverRelationalListField(field);
                      }}
                      key={`relational-list-field-${field.field.name}`}
                      onClick={() =>
                        props.detail?.onSelectView({
                          model: field.field?.name ?? '',
                          type: 'model',
                        })
                      }
                      variant={isActive ? 'outline' : 'ghost'}
                      className=""
                      size="sm"
                    >
                      {getFieldLabel(field.field)}
                    </Button>
                  );
                })}
              </div>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export const pageHeader = {
  default: DefaultPageHeaderMain,
  defaultDetail: DefaultPageHeaderDetail,
};
