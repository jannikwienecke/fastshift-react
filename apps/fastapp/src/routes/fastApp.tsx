import { Button, cn, Sidebar, SidebarBody, SidebarLink } from '@apps-next/ui';

import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { ErrorDetailsDialog } from '@apps-next/react';
import { observer } from '@legendapp/state/react';
import {
  CircleIcon,
  DotIcon,
  IconJarLogoIcon,
  MixIcon,
  SunIcon,
} from '@radix-ui/react-icons';
import {
  createFileRoute,
  ErrorComponent,
  Link,
  Outlet,
} from '@tanstack/react-router';
import { LoaderIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';
import { resettingDb$ } from '../application-store/app.store';

export const Route = createFileRoute('/fastApp')({
  component: () => <FastAppLayoutComponent />,
  errorComponent: (props) => {
    return <ErrorComponent {...props} />;
  },
});

const FastAppLayoutComponent = observer(() => {
  return (
    <>
      <Layout>
        <Outlet />
      </Layout>

      {resettingDb$.get() ? (
        <div className="fixed top-0 left-0 h-screen w-screen bg-black/50 flex items-center justify-center z-50">
          <LoaderIcon className="animate-spin h-10 w-10 text-white" />
        </div>
      ) : (
        <></>
      )}

      <ErrorDetailsDialog />
      <Toaster richColors duration={2000} />
    </>
  );
});

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const links = [
    {
      label: t('navigation.projects'),
      href: '/fastApp/projects',
      icon: (
        <DotIcon className="text-neutral-700 dark:text-neutral-200 h-4 w-4 flex-shrink-0" />
      ),
    },
    {
      label: t('navigation.tasks'),
      href: '/fastApp/Task',
      icon: (
        <CircleIcon className="text-neutral-700 dark:text-neutral-200 h-4 w-4 flex-shrink-0" />
      ),
    },
    {
      label: t('navigation.settings'),
      href: '#',
      icon: (
        <MixIcon className="text-neutral-700 dark:text-neutral-200 h-4 w-4 flex-shrink-0" />
      ),
    },
    {
      label: t('navigation.logout'),
      href: '#',
      icon: (
        <SunIcon className="text-neutral-700 dark:text-neutral-200 h-4 w-4 flex-shrink-0" />
      ),
    },
  ];
  const [_open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(true);

  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const allLanguages = ['de', 'en'];

  const open = pinned ? true : _open;

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div
      className={cn(
        'rounded-md flex flex-col md:flex-row w-full flex-1  mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden',
        'h-[99vh]'
      )}
    >
      <Sidebar open={open} setOpen={setOpen} isPinned={pinned}>
        <SidebarBody className="justify-between gap-10 mt-2  w-full border-r-[.5px]">
          <div className="flex flex-col flex-1 w-full overflow-y-auto">
            {open ? (
              <Logo
                pinned={pinned}
                onTogglePin={() => {
                  setPinned((prev) => !prev);
                }}
              />
            ) : (
              <LogoIcon />
            )}

            <div
              className={cn('mt-8 flex flex-col gap-2 ', open ? '' : 'items')}
            >
              {links.map((link, idx) => (
                <SidebarLink className="pl-4" key={idx} link={link} />
              ))}
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <div className="flex flex-wrap gap-2 text-sm text-neutral-500">
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

            <SidebarLink
              link={{
                label: 'Manu Arora',
                href: '#',
                icon: (
                  <img
                    src="https://assets.aceternity.com/manu.png"
                    className="h-8 w-8 rounded-full fit object-fill"
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {children}
    </div>
  );
}

export const Logo = ({
  onTogglePin,
  pinned,
}: {
  onTogglePin: () => void;
  pinned: boolean;
}) => {
  return (
    <Link
      to="/fastApp"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        <div className="flex flex-row items-center gap-2">
          <div>Acet Labs</div>
          <div className="cursor-pointer" onClick={onTogglePin}>
            {/* close icon */}
            {pinned ? (
              <IconJarLogoIcon className="text-black dark:text-white h-4 w-4" />
            ) : (
              <IconJarLogoIcon className="text-black dark:text-white h-4 w-4" />
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
