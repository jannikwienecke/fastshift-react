'use client';

import { notFound } from 'next/navigation';
import {
  registeredViewsAtom,
  registeredViewsServerAtom,
} from '@apps-next/core';
import { useAtomValue } from 'jotai';

export default function FallbackPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const registeredViewsClient = useAtomValue(registeredViewsAtom);
  const registeredViewsServer = useAtomValue(registeredViewsServerAtom);

  const registeredViews = {
    ...registeredViewsServer,
    ...registeredViewsClient,
  };

  const viewName = params.slug.join('/');
  const view = Object.values(registeredViews).find(
    (v) => v?.relativePath === viewName || v?.viewName === viewName
  );

  if (!view) {
    notFound();
  }

  return (
    <div>
      <h1>{view.viewName}</h1>
      <p>This is a fallback page for {view.viewName}.</p>
      {/* Add more content as needed */}
    </div>
  );
}
