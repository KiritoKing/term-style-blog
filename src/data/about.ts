export type AboutData = {
  heading: string;
  paragraphs: string[];
  skills: string[];
};

export const aboutData: AboutData = {
  heading: 'ABOUT_ME',
  paragraphs: [
    '这里是 ChlorineC 随便写写的地方。',
    '记录前端、工程化、AI 与生活，也保留一点终端和像素风格。',
  ],
  skills: ['Frontend', 'TypeScript', 'Engineering', 'AI'],
};
