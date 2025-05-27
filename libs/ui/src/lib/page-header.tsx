import {
  getFieldLabel,
  PageHeaderProps,
  useTranslation,
} from '@apps-next/core';
import {
  Layers3Icon,
  MoreHorizontal,
  SearchIcon,
  StarIcon,
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SearchInput,
} from './components';
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
          <BreadcrumbItem className="text-sm">
            <BreadcrumbLink href="/components">Views</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          <BreadcrumbItem className="text-sm">
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div>
                    <MoreHorizontal className="text-foreground/50" />
                    <span className="sr-only">{t('common.more')}</span>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56 rounded-lg text-sm">
                  {props.options?.map((option, index) => {
                    return (
                      <div key={index}>
                        {option.items.map((item) => {
                          return (
                            <DropdownMenuItem
                              key={item.label}
                              onClick={() => {
                                // item.onClick();
                                props.onSelectOption?.(item);
                              }}
                            >
                              {item.icon ? (
                                <item.icon className="text-muted-foreground" />
                              ) : null}

                              <span className="text-muted-foreground">
                                {item.label}
                              </span>
                            </DropdownMenuItem>
                          );
                        })}
                      </div>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

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
          <>
            <Button
              variant={'ghost'}
              size="icon"
              onClick={props.query?.toggleShowInput}
            >
              <SearchIcon className="h-4 w-4" />
            </Button>
          </>
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div>
                    <MoreHorizontal className="text-foreground/50" />
                    <span className="sr-only">{t('common.more')}</span>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56 rounded-lg text-sm">
                  {props.options.map((option, index) => {
                    return (
                      <div key={index}>
                        {option.items.map((item) => {
                          return (
                            <DropdownMenuItem
                              key={item.label}
                              onClick={() => {
                                // item.onClick();
                                props.onSelectOption?.(item);
                              }}
                            >
                              {item.icon ? (
                                <item.icon className="text-muted-foreground" />
                              ) : null}

                              <span className="text-muted-foreground">
                                {item.label}
                              </span>
                            </DropdownMenuItem>
                          );
                        })}
                      </div>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

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
