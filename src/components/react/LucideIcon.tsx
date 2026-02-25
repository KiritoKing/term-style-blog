import React from 'react';
import {
  Accessibility,
  ChevronRight,
  Command,
  FileText,
  Folder,
  Github,
  Layers,
  Mail,
  Moon,
  Sun,
  Tag,
  Terminal,
  Twitter,
  User,
  type LucideIcon,
} from 'lucide-react';
import type { LucideIconName } from '@/components/icons/lucide';

const iconMap: Record<LucideIconName, LucideIcon> = {
  accessibility: Accessibility,
  command: Command,
  moon: Moon,
  sun: Sun,
  folder: Folder,
  github: Github,
  layers: Layers,
  mail: Mail,
  tag: Tag,
  terminal: Terminal,
  twitter: Twitter,
  user: User,
  'chevron-right': ChevronRight,
  'file-text': FileText,
};

interface Props {
  name: LucideIconName;
  size?: number;
  className?: string;
}

export default function LucideIcon({ name, size = 16, className }: Props) {
  const IconComponent = iconMap[name];

  return (
    <IconComponent
      className={className}
      size={size}
      strokeWidth={2}
      aria-hidden="true"
      focusable="false"
    />
  );
}
