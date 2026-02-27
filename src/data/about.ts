export type AboutData = {
  heading: string;
  paragraphs: string[];
  skills: string[];
};

export const aboutData: AboutData = {
  heading: 'ABOUT_ME',
  paragraphs: [
    "Hi, I'm a developer who loves retro aesthetics, pixel art, and building things from scratch.",
    "I specialize in creating web experiences that don't just look like standard corporate templates. I believe the web should be fun, weird, and personal.",
  ],
  skills: ['React', 'TypeScript', 'Rust', 'TailwindCSS', 'Pixel Art', 'Linux'],
};
