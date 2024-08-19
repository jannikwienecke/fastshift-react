'use server';

import { Post } from '@prisma/client';
import { prisma } from '../../../db';
import { revalidatePath } from 'next/cache';
import { MutationProps, QueryDto } from '@apps-next/core';

export const filterTasks = async (query: string) => {
  return await prisma.post.findMany({
    where: {
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    },
  });
};

export const createTask = async (tasks: Pick<Post, 'title' | 'content'>) => {
  const post = await prisma.post.create({
    data: {
      ...tasks,
      authorId: 1,
    },
  });

  revalidatePath('/fastApp');
  return post;
};

export const viewLoader = async (options?: QueryDto) => {
  console.log('getTasks, options', options);
  const { query } = options || {};

  // TODO FIX THIS -> MUST BE GENERIC
  if (!query) return await prisma.post.findMany();

  return await prisma.post.findMany({
    where: {
      OR: [
        {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    },
  });
};

export const viewMutation = async (props: MutationProps) => {
  return null;
};

export const createNewPost = async (props: {
  title: string;
  content?: string;
}) => {
  const res = await prisma.post.create({
    data: {
      title: props.title,
      content: props.content,
      authorId: 1,
    },
  });

  console.log(res);
  return res;
};
