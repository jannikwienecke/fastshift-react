import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@apps-next/ui';
import {
  FlagIcon,
  Folder,
  Forward,
  LanguagesIcon,
  MoreHorizontal,
  Settings2Icon,
  Trash2,
} from 'lucide-react';
import { Nav } from './nav-main';
import { useTranslation } from 'react-i18next';

export function NavProjects() {
  const { isMobile } = useSidebar();

  const nav: Nav = {
    items: [
      {
        title: 'Settings',
        url: '/settings',
        icon: Settings2Icon,
        isActive: false,
      },
    ],
  };

  // todo add language switcher
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const allLanguages = ['de', 'en'];

  // const open = pinned ? true : _open;

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {/* <SidebarMenuItem>
         
        </SidebarMenuItem> */}

        {nav.items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
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
                className="w-48 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}
              >
                <DropdownMenuItem className="flex flex-row items-center">
                  <LanguagesIcon className="text-muted-foreground" />
                  <div className="flex-grow w-full" />

                  <div className="flex flex-row gap-2 text-sm text-neutral-500">
                    {allLanguages.map((lang) => (
                      <Button
                        key={lang}
                        variant={i18n.language === lang ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleLanguageChange(lang)}
                        className={cn(
                          'px-2 py-1 text-xs',
                          currentLanguage === lang
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-secondary'
                        )}
                      >
                        {lang.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}

        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
