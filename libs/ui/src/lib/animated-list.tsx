'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactElement, useMemo, useState } from 'react';

export interface AnimatedListProps {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  animateInitial?: boolean;
}

export const AnimatedList = React.memo(
  ({ className, children, delay = 50, animateInitial }: AnimatedListProps) => {
    const [index, setIndex] = useState(0);
    const childrenArray = React.Children.toArray(children);
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
    React.useEffect(() => {
      intervalRef.current = setInterval(() => {
        setIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % childrenArray.length;
          return isNaN(nextIndex) ? 0 : nextIndex;
        });
      }, delay);

      return () => {
        if (!intervalRef.current) return;
        clearInterval(intervalRef.current);
      };
    }, [childrenArray.length, delay]);

    React.useEffect(() => {
      if (index === childrenArray.length - 1 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, [childrenArray.length, index]);

    const itemsToShow = useMemo(
      () => childrenArray.slice(0, index + 1),
      [index, childrenArray]
    );

    const items = animateInitial ? itemsToShow : childrenArray;
    return (
      <ul className={`flex flex-col items-center gap-4 ${className}`}>
        <AnimatePresence>
          {items.map((item) => (
            <AnimatedListItem key={(item as ReactElement).key}>
              {item}
            </AnimatedListItem>
          ))}
        </AnimatePresence>
      </ul>
    );
  }
);

AnimatedList.displayName = 'AnimatedList';

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  const animations = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, originY: 0 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: 'spring', stiffness: 350, damping: 40 },
  };

  return (
    <motion.div {...animations} layout className="mx-auto w-full">
      {children}
    </motion.div>
  );
}
