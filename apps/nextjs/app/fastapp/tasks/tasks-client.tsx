'use client';

import { BaseViewConfigManager } from '@apps-next/core';
import { useQuery, ViewProvider } from '@apps-next/react';
import { List } from '@apps-next/ui';
import { Post, Prisma } from '@prisma/client';
import React, { useOptimistic } from 'react';
import { createNewPost } from './actions';
import { _createView } from './create-prisma-view';

export const TasksClient = ({
  datamodel,
}: {
  datamodel: Prisma.DMMF.Datamodel;
}) => {
  const data = _createView('post', {} as any);
  console.log(data.data.authorId);
  const getListPRops = data.useList();
  const name = getListPRops().items?.[0].published;

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
  const [showForm, setShowForm] = React.useState(false);

  const { data, refetch } = useQuery({ query: query?.value ?? '' });
  const tasks = (data || []) as Post[];

  const formAction = async (formData: FormData) => {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    addOptimisically({
      title: title,
      content: content,
    });

    setShowForm(false);

    await createNewPost({
      title: title,
      content: content,
    });

    refetch();
  };

  const [optimicPosts, addOptimisically] = useOptimistic(
    tasks,
    (
      state,
      action: {
        title: string;
        content: string;
      }
    ) => {
      return [
        ...state,
        {
          id: Math.random() * 10000000,
          ...action,
          published: false,
          authorId: 1,
        },
      ];
    }
  );

  return (
    <div>
      <div>
        <h1 className="font-bold flex flex-row gap-2 items-center ">
          <span>Tasks</span>
          <span>
            <button onClick={() => setShowForm(true)}>Create</button>
          </span>
        </h1>

        <input
          className="border border-black p-1 px-4 rounded-md"
          placeholder="Search"
          value={query?.value ?? ''}
          onChange={(e) => setQuery({ value: e.target.value })}
        />

        <dialog open={showForm}>
          <article>
            <div>
              <h2>Create new Post</h2>
            </div>

            <form action={formAction}>
              <input
                className="border border-black p-1 px-4 rounded-md"
                placeholder="Title"
                name="title"
              />
              <input
                className="border border-black p-1 px-4 rounded-md"
                placeholder="Content"
                name="content"
              />
              <div className="flex flex-row gap-2">
                <button className="">Create</button>

                <button
                  onClick={() => setShowForm(false)}
                  className="secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </article>
        </dialog>

        <List
          items={
            optimicPosts?.map((task) => ({
              name: task.title,
              description: task.content ?? '',
            })) ?? []
          }
        />
      </div>
    </div>
  );
};
