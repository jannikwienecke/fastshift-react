import { useHydrateAtoms } from 'jotai/utils';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function HydrateAtoms({ initialValues, children }: any) {
  useHydrateAtoms(initialValues, { dangerouslyForceHydrate: true });
  return <>{children}</>;
}
