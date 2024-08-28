'use client';

import { AnimatedTab, ComboboxPopover, Filter } from '@apps-next/ui';
import React from 'react';

type Status = {
  value: string;
  label: string;
};

const statuses: Status[] = [
  {
    value: 'backlog',
    label: 'Backlog',
  },
  {
    value: 'todo',
    label: 'Todo',
  },
  {
    value: 'in progress',
    label: 'In Progress',
  },
  {
    value: 'done',
    label: 'Done',
  },
  {
    value: 'canceled',
    label: 'Canceled',
  },
];

export default function FastAppTryPage() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  return (
    <div>
      <AnimatedTab
        tabs={[
          { id: '1', label: 'Tab 1' },
          { id: '2', label: 'Tab 2' },
          { id: '3', label: 'Tab 3' },
          { id: '4', label: 'Tab 4' },
        ]}
        onTabChange={(tab) => console.log('Active tab:', tab)}
      />

      <div>
        <Filter />
      </div>
    </div>
  );
}
