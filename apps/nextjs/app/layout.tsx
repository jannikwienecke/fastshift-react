import './global.css';

import { GeistSans } from 'geist/font/sans';

import React from 'react';
import { ReactQueryProvider } from './react-query-provider';

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
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
