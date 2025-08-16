'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type RotatingTextProps = {
  text: string | string[];
  duration?: number;
  className?: string;
  containerClassName?: string;
};

function RotatingText({
  text,
  duration = 2000,
  className,
  containerClassName,
}: RotatingTextProps) {
  const [index, setIndex] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (!Array.isArray(text)) return;
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % text.length);
        setIsVisible(true);
      }, 150);
    }, duration);
    return () => clearInterval(interval);
  }, [text, duration]);

  const currentText = Array.isArray(text) ? text[index] : text;

  return (
    <div className={cn('overflow-hidden py-1', containerClassName)}>
      <div
        className={cn(
          'transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0',
          className
        )}
      >
        {currentText}
      </div>
    </div>
  );
}

export { RotatingText, type RotatingTextProps };
