import {
  PrismaQueryProviderServer,
  prismaViewLoader,
  prismaViewMutation,
} from '@apps-next/query-adapter';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './global.css';

import { GeistSans } from 'geist/font/sans';

import React from 'react';
import { globalConfig } from './global-config';
import { prisma } from '../db';

export const metadata = {
  title: 'Example App For FastApp Framework',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <PrismaQueryProviderServer
          config={globalConfig.config}
          api={{
            viewLoader: async (dto) => {
              'use server';
              return prismaViewLoader(prisma, dto);
            },
            viewMutation: async (props) => {
              'use server';
              return prismaViewMutation(prisma, props);
            },
          }}
        >
          {children}

          <ReactQueryDevtools initialIsOpen={false} />
        </PrismaQueryProviderServer>
      </body>
    </html>
  );
}
