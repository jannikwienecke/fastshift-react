'use client';

import * as React from 'react';
import { CaretSortIcon, CheckIcon, DotIcon } from '@radix-ui/react-icons';

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
    icon: <DotIcon />, // Using FaReact as a placeholder
  },
  {
    value: 'sveltekit',
    label: 'SvelteKit',
    icon: <DotIcon />, // Using SiSvelte as a placeholder
  },
  {
    value: 'nuxt.js',
    label: 'Nuxt.js',
    icon: <DotIcon />, // Using FaVuejs as a placeholder
  },
  {
    value: 'remix',
    label: 'Remix',
    icon: <DotIcon />, // Using SiRemix as a placeholder
  },
  {
    value: 'astro',
    label: 'Astro',
    icon: <DotIcon />, // Using FaMeteor as a placeholder
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
