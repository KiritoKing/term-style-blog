export const lucideIconNames = [
  'accessibility',
  'command',
  'moon',
  'sun',
  'folder',
  'github',
  'layers',
  'mail',
  'tag',
  'terminal',
  'twitter',
  'user',
  'chevron-right',
  'file-text',
] as const;

export type LucideIconName = (typeof lucideIconNames)[number];
