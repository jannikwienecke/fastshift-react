'use client';

import { ComboxboxItem } from '@apps-next/ui';
import React from 'react';

type Status = {
  id: string;
  value: string;
  label: string;
};

const statuses: Status[] = [
  { id: 'backlog', value: 'backlog', label: 'Backlog' },
  { id: 'todo', value: 'todo', label: 'Todo' },
  { id: 'in_progress', value: 'in progress', label: 'In Progress' },
  { id: 'done', value: 'done', label: 'Done' },
  { id: 'canceled', value: 'canceled', label: 'Canceled' },
];

export default function FastAppTryPage() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState<ComboxboxItem | null>(null);

  const handleInputChange = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleChange = (value: ComboxboxItem) => {
    setSelected(value);
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const renderItem = (value: ComboxboxItem) => {
    return <div>{value.label}</div>;
  };

  const [position, setPosition] = React.useState<{
    top: number;
    left: number;
    bottom: number;
    right: number;
  } | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {statuses.map((status) => (
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setPosition(rect);
            setOpen(true);
          }}
          key={status.id}
        >
          {status.label}
        </div>
      ))}
    </div>
  );
}
