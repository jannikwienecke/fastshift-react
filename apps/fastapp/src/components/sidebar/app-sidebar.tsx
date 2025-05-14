'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@apps-next/ui';
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Home,
  Inbox,
  Search,
  Sparkles,
} from 'lucide-react';
import * as React from 'react';
import { NavCommon } from './nav-common';
import { NavFavorites } from './nav-favorites';
import { NavMain } from './nav-main';
import { NavSettings } from './nav-settings';
import { NavUser } from './nav-user';
import { TeamSwitcher } from './team-switcher';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
  navCommon: [
    {
      title: 'Search',
      url: '#',
      icon: Search,
    },
    {
      title: 'Ask AI',
      url: '#',
      icon: Sparkles,
    },
    {
      title: 'Home',
      url: '#',
      icon: Home,
      isActive: true,
    },
    {
      title: 'Inbox',
      url: '#',
      icon: Inbox,
      badge: '10',
    },
  ],

  workspaces: [
    {
      name: 'Personal Life Management',
      emoji: '🏠',
      pages: [
        {
          name: 'Daily Journal & Reflection',
          url: '#',
          emoji: '📔',
        },
        {
          name: 'Health & Wellness Tracker',
          url: '#',
          emoji: '🍏',
        },
        {
          name: 'Personal Growth & Learning Goals',
          url: '#',
          emoji: '🌟',
        },
      ],
    },
    {
      name: 'Professional Development',
      emoji: '💼',
      pages: [
        {
          name: 'Career Objectives & Milestones',
          url: '#',
          emoji: '🎯',
        },
        {
          name: 'Skill Acquisition & Training Log',
          url: '#',
          emoji: '🧠',
        },
        {
          name: 'Networking Contacts & Events',
          url: '#',
          emoji: '🤝',
        },
      ],
    },
    {
      name: 'Creative Projects',
      emoji: '🎨',
      pages: [
        {
          name: 'Writing Ideas & Story Outlines',
          url: '#',
          emoji: '✍️',
        },
        {
          name: 'Art & Design Portfolio',
          url: '#',
          emoji: '🖼️',
        },
        {
          name: 'Music Composition & Practice Log',
          url: '#',
          emoji: '🎵',
        },
      ],
    },
    {
      name: 'Home Management',
      emoji: '🏡',
      pages: [
        {
          name: 'Household Budget & Expense Tracking',
          url: '#',
          emoji: '💰',
        },
        {
          name: 'Home Maintenance Schedule & Tasks',
          url: '#',
          emoji: '🔧',
        },
        {
          name: 'Family Calendar & Event Planning',
          url: '#',
          emoji: '📅',
        },
      ],
    },
    {
      name: 'Travel & Adventure',
      emoji: '🧳',
      pages: [
        {
          name: 'Trip Planning & Itineraries',
          url: '#',
          emoji: '🗺️',
        },
        {
          name: 'Travel Bucket List & Inspiration',
          url: '#',
          emoji: '🌎',
        },
        {
          name: 'Travel Journal & Photo Gallery',
          url: '#',
          emoji: '📸',
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar data-testid="sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavCommon items={data.navCommon} />
        <NavFavorites />
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavSettings />

        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
