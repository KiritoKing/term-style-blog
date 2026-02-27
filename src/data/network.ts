import type { LucideIconName } from '@/components/icons/lucide';

export type NetworkLinkConfig = {
  icon: LucideIconName;
  label: string;
  href: string;
};

export const networkLinks: NetworkLinkConfig[] = [
  { icon: 'github', label: 'github', href: 'https://github.com/' },
  { icon: 'twitter', label: 'twitter', href: 'https://twitter.com/' },
  { icon: 'mail', label: 'email', href: 'mailto:hello@example.com' },
];
