import { api, views } from '@apps-next/convex';
import { Emoji, GetTableName } from '@apps-next/core';
import {
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@apps-next/ui';
import { convexQuery } from '@convex-dev/react-query';
import { observable } from '@legendapp/state';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import { observer } from '@legendapp/state/react';
import { syncObservable } from '@legendapp/state/sync';
import { useQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import {
  ArrowUpRight,
  ChevronDownIcon,
  ChevronRight,
  ChevronRightIcon,
  MoreHorizontal,
  PencilIcon,
  Trash2,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type Nav = {
  items: {
    title: string;
    url?: string;
    icon?: React.FC<any>;
    emoji?: Emoji;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      emoji?: Emoji;
    }[];
  }[];
};

const open$ = observable(false);
syncObservable(open$, {
  persist: {
    name: 'store-global',
    plugin: ObservablePersistLocalStorage,
  },
});

export const NavMain = observer(() => {
  const { t } = useTranslation();

  const { data: allUserViews } = useQuery(
    convexQuery(api.query.getUserViews, {})
  );
  const userViews = allUserViews?.filter(
    (view) => !view._deleted && !view.rowId
  );

  if (!userViews) return null;

  const viewsTables: GetTableName[] = ['projects', 'tasks'];
  const coreDataTables: GetTableName[] = [
    'tags',
    'categories',
    'owner',
    'users',
    'history',
  ];

  const mainViews = viewsTables.map((key) => {
    const view = Object.values(views).find((v) => v?.tableName === key);

    const viewsOf = userViews.filter(
      (v) =>
        v.baseView?.toLowerCase() === view?.viewName.toLowerCase() &&
        v.name !== key &&
        !v.parentModel
    );

    return {
      title: t(`navigation.${key}` as any),
      url: `/fastApp/${key}`,
      isActive: false,
      icon: view?.icon,

      items: viewsOf.map((view) => ({
        title: view.name ?? '',
        url: `/fastApp/${view.slug}`,
        emoji: view.emoji,
      })),
      // icon:
    } satisfies Nav['items'][number];
  });

  const coreData = coreDataTables.map((key) => {
    const view = Object.values(views).find((v) => v?.tableName === key);
    const viewsOf = userViews.filter(
      (v) => v.baseView === view?.viewName && v.name !== key && !v.parentModel
    );

    return {
      title: t(`navigation.${key}` as any),
      url: `/fastApp/${key}`,
      isActive: false,
      icon: view?.icon,
      items: viewsOf.map((view) => ({
        title: view.name ?? '',
        url: `/fastApp/${view.slug}`,
        emoji: view.emoji,
      })),
      // icon:
    } satisfies Nav['items'][number];
  });

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Views</SidebarGroupLabel>

        <SidebarMenu>
          {mainViews.map((view) => (
            <NavItem key={view.title} item={view} />
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <Collapsible
          onOpenChange={(open) => open$.set(open)}
          open={open$.get()}
          className="group/collapsible"
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              <SidebarGroupLabel className="p-0">Core Data</SidebarGroupLabel>
              <ChevronRightIcon className="ml-auto group-data-[state=open]/collapsible:hidden" />
              <ChevronDownIcon className="ml-auto group-data-[state=closed]/collapsible:hidden" />
            </SidebarMenuButton>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenu>
              {coreData.map((view) => (
                <NavItem key={view.title} item={view} />
              ))}
            </SidebarMenu>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>
    </>
  );
});

export const NavItem = ({ item }: { item: Nav['items'][number] }) => {
  const [hover, setHover] = React.useState('');
  const { t } = useTranslation();
  const { isMobile } = useSidebar();

  const router = useRouter();

  const hasSubItems = item.items && item.items.length > 0;

  if (!hasSubItems) {
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={item.isActive}>
          <Link preload="intent" to={item.url ?? ''}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      key={item.title}
      asChild
      defaultOpen={item.isActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight className="relative transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem
                key={subItem.title}
                className="flex flex-row items-center justify-between hover:bg-sidebar-accent"
              >
                <SidebarMenuSubButton className="w-full" asChild>
                  <Link
                    onMouseOver={() => setHover(subItem.title)}
                    to={subItem.url}
                    preload="intent"
                    className="flex-grow"
                    onClick={() => {
                      // router.invalidate();
                    }}
                  >
                    <span className="">{subItem.title}</span>
                    {subItem.emoji ? (
                      <div className="w-4">{subItem.emoji?.emoji}</div>
                    ) : (
                      <div className="w-4"></div>
                    )}
                  </Link>
                </SidebarMenuSubButton>

                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      className={cn(
                        'relative -left-1 top-0 invisible',
                        hover === subItem.title ? 'visible' : ''
                      )}
                    >
                      <SidebarMenuAction>
                        <MoreHorizontal className="" />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 rounded-lg"
                      side={isMobile ? 'bottom' : 'right'}
                      align={isMobile ? 'end' : 'start'}
                    >
                      <DropdownMenuItem>
                        <PencilIcon className="text-muted-foreground" />
                        <span>{t('common.edit')}</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem>
                        <Trash2 className="text-muted-foreground" />
                        <span>{t('common.delete', { name: '' })}</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link className="text-muted-foreground" />
                        <span>{t('copy.url')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ArrowUpRight className="text-muted-foreground" />
                        <span>{t('common.openInNewTab')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};
