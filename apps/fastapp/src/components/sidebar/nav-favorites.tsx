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
import {
  ArrowUpRight,
  ChevronDownIcon,
  ChevronRightIcon,
  Link,
  MoreHorizontal,
  StarOff,
  Trash2,
} from 'lucide-react';
import { getUserViews } from '../../query-client';
import { observer } from '@legendapp/state/react';
import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@apps-next/convex';

export const NavFavorites = observer(() => {
  const { isMobile } = useSidebar();
  const { data: allViews } = useQuery(convexQuery(api.query.getUserViews, {}));
  const starredViews = allViews?.filter((view) => view.starred);

  console.log('starredViews', starredViews);

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
            {starredViews?.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <a href={item.slug} title={item.name}>
                    {/* <span>{item.emoji}</span> */}
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                      <MoreHorizontal />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 rounded-lg"
                    side={isMobile ? 'bottom' : 'right'}
                    align={isMobile ? 'end' : 'start'}
                  >
                    <DropdownMenuItem>
                      <StarOff className="text-muted-foreground" />
                      <span>Remove from Favorites</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link className="text-muted-foreground" />
                      <span>Copy Link</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
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
            ))}
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
