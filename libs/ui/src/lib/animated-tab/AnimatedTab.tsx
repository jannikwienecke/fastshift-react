import React, { useState } from 'react';
import { motion } from 'framer-motion';

export type TabItem = {
  id: string;
  label: string;
};

type AnimatedTabProps<T extends TabItem> = {
  tabs: T[];
  onTabChange?: (tab: T) => void;
};

export function AnimatedTab<T extends TabItem>({
  tabs,
  onTabChange,
}: AnimatedTabProps<T>) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const handleTabClick = (tab: T) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="relative flex bg-gray-100 rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab)}
          className={`relative z-10 px-4 py-2 text-sm font-medium transition-colors duration-300 ${
            activeTab?.id === tab.id
              ? 'text-white'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
      <motion.div
        className="absolute left-0 top-0 bottom-0 rounded-md bg-blue-500"
        initial={false}
        animate={{
          width: `${100 / tabs.length}%`,
          x: `${tabs.findIndex((tab) => tab.id === activeTab?.id) * 100}%`,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    </div>
  );
}
