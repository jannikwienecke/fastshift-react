import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenuAction,
  useShadCnSidebar,
  cn,
} from '@apps-next/ui';
import { Link } from '@tanstack/react-router';
import {
  ArrowUpRight,
  ChevronRight,
  MoreHorizontal,
  PencilIcon,
  StarOff,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getUserViews } from '../../query-client';
import { views } from '@apps-next/convex';
import { GetTableName } from '@apps-next/core';
import { viewRegistry } from '@apps-next/react';
import React from 'react';

type Nav = {
  items: {
    title: string;
    url?: string;
    icon?: React.FC<any>;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
};

export function NavMain() {
  const { t } = useTranslation();

  const userViews = getUserViews();

  const tablesToShow: GetTableName[] = ['projects', 'tasks', 'tags', 'owner'];

  const mainViews = tablesToShow.map((key) => {
    const view = Object.values(views).find((v) => v?.tableName === key);
    const viewsOf = userViews.filter(
      (v) => v.baseView === view?.viewName && v.name !== key
    );

    return {
      title: t(`navigation.${key}` as any),
      url: `/fastApp/${key}`,
      isActive: false,
      icon: view?.icon,
      items: viewsOf.map((view) => ({
        title: view.name,
        url: `/fastApp/${view.slug}`,
      })),
      // icon:
    } satisfies Nav['items'][number];
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Views</SidebarGroupLabel>

      <SidebarMenu>
        {mainViews.map((view) => (
          <NavItem key={view.title} item={view} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export const NavItem = ({ item }: { item: Nav['items'][number] }) => {
  const [hover, setHover] = React.useState('');
  const { t } = useTranslation();
  const { isMobile } = useShadCnSidebar();

  const hasSubItems = item.items && item.items.length > 0;

  if (!hasSubItems) {
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={item.isActive}>
          <Link to={item.url ?? ''}>
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
                    className="flex-grow"
                  >
                    <span className="">{subItem.title}</span>
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
