import { useHydrateAtoms } from 'jotai/utils';
import React from 'react';

export function HydrateAtoms({ initialValues, children }: any) {
  useHydrateAtoms(initialValues, { dangerouslyForceHydrate: true });
  return <>{children}</>;
}
