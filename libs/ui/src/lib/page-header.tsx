import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import {
  Layers3Icon,
  MoreHorizontal,
  PencilIcon,
  StarIcon,
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Button,
} from './components';
import {
  getFieldLabel,
  PageHeaderProps,
  t,
  useTranslation,
} from '@apps-next/core';
import { cn } from './utils';

const DefaultPageHeaderMain = (props: PageHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-row items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="text-sm">
            <BreadcrumbLink href="/components">Views</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          <BreadcrumbItem className="text-sm">
            <BreadcrumbPage className="flex flex-row gap-4 items-center">
              <div className="flex flex-row gap-2 items-center">
                {props.icon ? <props.icon className="w-4 h-4" /> : null}
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
    </div>
  );
};

const DefaultPageHeaderDetail = (props: PageHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-row items-center justify-between">
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
                {props.icon ? <props.icon className="w-4 h-4" /> : null}
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
