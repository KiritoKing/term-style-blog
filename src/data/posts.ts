export interface Post {
  id: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  content: string;
}

export const POSTS: Post[] = [
  {
    id: 'hello-world-cn',
    title: '你好，世界',
    date: '2026-02-24',
    category: 'General',
    tags: ['中文', '测试'],
    content:
      '这是一个测试帖子，用于检验多语言文本的字体渲染效果。确保其他语言，特别是CJK文字也能正确渲染像素风格字体。\n\n像素字体在中文下的表现通常比较具有挑战性，我们需要确保它既有复古感，又能保持良好的可读性。',
  },
  {
    id: 'hello-world',
    title: 'Hello World',
    date: '2026-02-23',
    category: 'General',
    tags: ['personal', 'update'],
    content:
      "Welcome to my new console-based blog. I built this using React and Tailwind CSS. The design is inspired by retro terminals and pixel art.\n\nI wanted a space that feels like home, a place where I can drop my thoughts without the overhead of a heavy CMS. Everything here is just plain text, rendered in a way that makes my inner nerd happy.\n\nFeel free to poke around. Try typing some commands in the prompt below!",
  },
  {
    id: 'learning-rust',
    title: 'Rewriting everything in Rust',
    date: '2026-02-15',
    category: 'Tech',
    tags: ['rust', 'programming'],
    content:
      'It finally happened. I succumbed to the crab. Here is my journey of rewriting my side projects in Rust.\n\nThe borrow checker is notoriously difficult to grasp at first, but once it clicks, it feels like you have a superpower. No more null pointer dereferences, no more data races. Just pure, unadulterated performance and safety.\n\n```rust\nfn main() {\n    println!("Hello, world!");\n}\n```\n\nI started by porting a small CLI tool I wrote in Node.js. The performance difference was staggering. What used to take 500ms now takes 12ms. I am officially a Rustacean.',
  },
  {
    id: 'pixel-art-tips',
    title: 'Pixel Art Basics',
    date: '2026-01-30',
    category: 'Art',
    tags: ['art', 'design'],
    content:
      "Pixel art is all about constraints. By limiting your resolution and color palette, you force yourself to focus on form and readability.\n\n1. **Start Small**: Don't try to draw a 128x128 character right away. Start with 16x16 or 32x32. It forces you to abstract details.\n2. **Limit Colors**: Use a pre-made palette like Endesga 32 or Pico-8. Too many colors make pixel art look muddy.\n3. **Avoid Jaggies**: Smooth out your curves. A line should step consistently (e.g., 2 pixels, 2 pixels, 2 pixels, not 2, 1, 3, 2).\n\nPractice every day, and you'll see improvement quickly!",
  },
];

export const LATEST_POST = POSTS[0];

export const getCategories = (): string[] =>
  Array.from(new Set(POSTS.map((post) => post.category.toLowerCase())));

export const getTags = (): string[] =>
  Array.from(new Set(POSTS.flatMap((post) => post.tags.map((tag) => tag.toLowerCase()))));

export const getPostById = (id: string): Post | undefined => POSTS.find((post) => post.id === id);

export const getPostsByCategory = (category: string): Post[] =>
  POSTS.filter((post) => post.category.toLowerCase() === category.toLowerCase());

export const getPostsByTag = (tag: string): Post[] =>
  POSTS.filter((post) => post.tags.map((entry) => entry.toLowerCase()).includes(tag.toLowerCase()));
