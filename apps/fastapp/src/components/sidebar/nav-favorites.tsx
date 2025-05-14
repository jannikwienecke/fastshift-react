import { api } from '@apps-next/convex';
import { getView, store$ } from '@apps-next/react';
import {
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
  useSidebar,
} from '@apps-next/ui';
import { convexQuery } from '@convex-dev/react-query';
import { observer } from '@legendapp/state/react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  ArrowUpRight,
  ChevronDownIcon,
  ChevronRightIcon,
  Link as LinkIcon,
  MoreHorizontal,
  StarOff,
  Trash2,
} from 'lucide-react';

export const NavFavorites = observer(() => {
  const { isMobile } = useSidebar();
  const { data: allViews } = useQuery(convexQuery(api.query.getUserViews, {}));
  const starredViews = allViews?.filter(
    (view) => view.starred && !view._deleted
  );

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <Collapsible
        //   key={item.title}
        defaultOpen={true}
        className="group/collapsible"
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <SidebarGroupLabel className="p-0">Favorites</SidebarGroupLabel>
            <ChevronRightIcon className="ml-auto group-data-[state=open]/collapsible:hidden" />
            <ChevronDownIcon className="ml-auto group-data-[state=closed]/collapsible:hidden" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenu>
            {starredViews?.map((item) => {
              const view = getView(item.baseView ?? '');

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link
                      preload="intent"
                      to={
                        item.rowId
                          ? `/fastApp/${item.baseView ?? ''}/${
                              item.rowId
                            }/overview`
                          : `/fastApp/${item.slug}`
                      }
                      title={item.name}
                    >
                      {item.emoji ? (
                        <> {item.emoji.emoji}</>
                      ) : (
                        <>
                          {view?.icon ? (
                            <view.icon className="w-4 h-4" />
                          ) : (
                            <span className="w-4 h-4" />
                          )}
                        </>
                      )}
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal />
                        <span className="sr-only">{item.name + ' more'}</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 rounded-lg"
                      side={isMobile ? 'bottom' : 'right'}
                      align={isMobile ? 'end' : 'start'}
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          store$.updateViewMutation({
                            id: item.id,
                            starred: !item.starred,
                          });
                        }}
                      >
                        <StarOff className="text-muted-foreground" />
                        <span>Remove from Favorites</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/fastApp/${item.slug}`
                          );
                        }}
                      >
                        <LinkIcon className="text-muted-foreground" />
                        <span>Copy Link</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          window.open(`/fastApp/${item.slug}`, '_blank');
                        }}
                      >
                        <ArrowUpRight className="text-muted-foreground" />
                        <span>Open in New Tab</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Trash2 className="text-muted-foreground" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              );
            })}
            <SidebarMenuItem>
              <SidebarMenuButton className="text-sidebar-foreground/70">
                <MoreHorizontal />
                <span>More</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
});
