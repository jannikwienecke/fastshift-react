'use client';

import * as React from 'react';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';

// Import specific icons from react-icons
import { FaReact as NextJsIcon } from 'react-icons/fa'; // Example icon for Next.js
import { SiSvelte as SvelteKitIcon } from 'react-icons/si'; // Example icon for SvelteKit
import { FaVuejs as NuxtJsIcon } from 'react-icons/fa'; // Example icon for Nuxt.js
import { SiRemix as RemixIcon } from 'react-icons/si'; // Example icon for Remix
import { FaMeteor as AstroIcon } from 'react-icons/fa'; // Example icon for Astro

// Replace the alias import with a relative path
// import { cn } from '@/lib/utils';
import { cn } from '../utils';

import { Button } from '../components/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../components/command';
import { Popover, PopoverContent, PopoverTrigger } from '../components/popover';

const frameworks = [
  {
    value: 'next.js',
    label: 'Next.js',
    icon: <NextJsIcon />, // Using FaReact as a placeholder
  },
  {
    value: 'sveltekit',
    label: 'SvelteKit',
    icon: <SvelteKitIcon />, // Using SiSvelte as a placeholder
  },
  {
    value: 'nuxt.js',
    label: 'Nuxt.js',
    icon: <NuxtJsIcon />, // Using FaVuejs as a placeholder
  },
  {
    value: 'remix',
    label: 'Remix',
    icon: <RemixIcon />, // Using SiRemix as a placeholder
  },
  {
    value: 'astro',
    label: 'Astro',
    icon: <AstroIcon />, // Using FaMeteor as a placeholder
  },
];

export function Filter() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : 'Select framework...'}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." className="h-9" />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  {framework.icon}

                  {framework.label}
                  <CheckIcon
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === framework.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
