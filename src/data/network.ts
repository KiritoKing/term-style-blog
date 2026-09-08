import type { LucideIconName } from '@/components/icons/lucide';

export type NetworkLinkConfig = {
  icon: LucideIconName;
  label: string;
  href: string;
};

export const networkLinks: NetworkLinkConfig[] = [
  { icon: 'github', label: 'github/KiritoKing', href: 'https://github.com/KiritoKing' },
];
