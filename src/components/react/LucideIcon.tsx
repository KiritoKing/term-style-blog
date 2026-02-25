import React from 'react';
import { lucideIconPaths, type LucideIconName } from '@/components/icons/lucide';

interface Props {
  name: LucideIconName;
  size?: number;
  className?: string;
}

export default function LucideIcon({ name, size = 16, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: lucideIconPaths[name] }}
    />
  );
}
