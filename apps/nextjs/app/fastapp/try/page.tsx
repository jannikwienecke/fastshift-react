'use client';

import { AnimatedTab, Filter } from '@apps-next/ui';

export default function FastAppTryPage() {
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
