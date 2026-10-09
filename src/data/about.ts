import { siteConfig } from '../../site.config';

export type AboutData = {
  heading: string;
  paragraphs: string[];
  skills: string[];
};

export const aboutData: AboutData = siteConfig.about;
