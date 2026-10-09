import { siteConfig } from '../../site.config';
import type { LucideIconName } from '@/components/icons/lucide';

export type NetworkLinkConfig = {
  icon: LucideIconName;
  label: string;
  href: string;
};

export const networkLinks: NetworkLinkConfig[] = siteConfig.network;
