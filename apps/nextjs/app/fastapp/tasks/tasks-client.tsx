'use client';

import { List } from '@apps-next/ui';
import {
  BaseViewConfigManager,
  createConfigFromPrismaSchema,
} from '@apps-next/core';
import { useQuery, ViewProvider } from '@apps-next/react';
import React from 'react';
import { createTask } from './actions';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../db';

const config = createConfigFromPrismaSchema<typeof Prisma, typeof prisma>(
  Prisma,
  prisma
);

const x = config.getAllTables()[0] === 'post';

export const TasksClient = () => {
  return (
    <>
      <ViewProvider
        view={{
          viewConfigManager: new BaseViewConfigManager({
            viewFields: {} as any,
            tableName: 'tasks',
            dbProvider: 'prisma',
            viewName: 'tasks',
            displayField: {
              field: 'name',
            },
          }),
        }}
      >
        <TasksClientContent />
      </ViewProvider>
    </>
  );
};

export const TasksClientContent = () => {
  const [query, setQuery] = React.useState<{ value: string } | null>(null);

  const { data: tasks } = useQuery({});

  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');

  return (
    <div>
      <div>
        <div className="text-xl font-bold">Tasks</div>

        <input
          className="border border-black p-1 px-4 rounded-md"
          placeholder="Search"
          value={query?.value ?? ''}
          onChange={(e) => setQuery({ value: e.target.value })}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <input
            className="border border-black p-1 px-4 rounded-md"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="border border-black p-1 px-4 rounded-md"
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            className="border border-black p-1 px-4 rounded-md"
            onClick={async () => await createTask({ title, content })}
          >
            Create
          </button>
        </form>

        <List
          items={
            tasks?.map((task) => ({
              name: task.title,
              description: task.content ?? '',
            })) ?? []
          }
        />
      </div>
    </div>
  );
};
