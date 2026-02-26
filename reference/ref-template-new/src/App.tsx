import React, { useState, useEffect, useRef } from 'react';
import { Terminal, User, FileText, Folder, ChevronRight, Github, Twitter, Mail, Command, Monitor, Moon, Sun, Accessibility, Tag, Layers } from 'lucide-react';

const POSTS = [
  { 
    id: 'hello-world-cn', 
    title: '你好，世界', 
    date: '2026-02-24', 
    category: 'General',
    tags: ['中文', '测试'], 
    content: '这是一个测试帖子，用于检验多语言文本的字体渲染效果。确保其他语言，特别是CJK文字也能正确渲染像素风格字体。\n\n像素字体在中文下的表现通常比较具有挑战性，我们需要确保它既有复古感，又能保持良好的可读性。' 
  },
  { 
    id: 'hello-world', 
    title: 'Hello World', 
    date: '2026-02-23', 
    category: 'General',
    tags: ['personal', 'update'], 
    content: 'Welcome to my new console-based blog. I built this using React and Tailwind CSS. The design is inspired by retro terminals and pixel art.\n\nI wanted a space that feels like home, a place where I can drop my thoughts without the overhead of a heavy CMS. Everything here is just plain text, rendered in a way that makes my inner nerd happy.\n\nFeel free to poke around. Try typing some commands in the prompt below!' 
  },
  { 
    id: 'learning-rust', 
    title: 'Rewriting everything in Rust', 
    date: '2026-02-15', 
    category: 'Tech',
    tags: ['rust', 'programming'], 
    content: 'It finally happened. I succumbed to the crab. Here is my journey of rewriting my side projects in Rust.\n\nThe borrow checker is notoriously difficult to grasp at first, but once it clicks, it feels like you have a superpower. No more null pointer dereferences, no more data races. Just pure, unadulterated performance and safety.\n\n```rust\nfn main() {\n    println!("Hello, world!");\n}\n```\n\nI started by porting a small CLI tool I wrote in Node.js. The performance difference was staggering. What used to take 500ms now takes 12ms. I am officially a Rustacean.' 
  },
  { 
    id: 'pixel-art-tips', 
    title: 'Pixel Art Basics', 
    date: '2026-01-30', 
    category: 'Art',
    tags: ['art', 'design'], 
    content: 'Pixel art is all about constraints. By limiting your resolution and color palette, you force yourself to focus on form and readability.\n\n1. **Start Small**: Don\'t try to draw a 128x128 character right away. Start with 16x16 or 32x32. It forces you to abstract details.\n2. **Limit Colors**: Use a pre-made palette like Endesga 32 or Pico-8. Too many colors make pixel art look muddy.\n3. **Avoid Jaggies**: Smooth out your curves. A line should step consistently (e.g., 2 pixels, 2 pixels, 2 pixels, not 2, 1, 3, 2).\n\nPractice every day, and you\'ll see improvement quickly!' 
  },
];

export default function App() {
  const [route, setRoute] = useState('home');
  const [input, setInput] = useState('');
  const [booting, setBooting] = useState(true);
  const [bootText, setBootText] = useState('');
  
  // Theme and Font states
  const [isDark, setIsDark] = useState(true);
  const [isA11yMode, setIsA11yMode] = useState(false);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [terminalOutput, setTerminalOutput] = useState<{type: 'cmd' | 'out' | 'err', text: string}[]>([
    { type: 'out', text: 'Type "help" to see available commands.' }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const terminalScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getPromptPath = () => {
    if (route === 'home') return '~';
    if (route.startsWith('post/')) return `~/${route.replace('post/', 'posts/')}`;
    if (route.startsWith('category/')) return `~/${route.replace('category/', 'categories/')}`;
    if (route.startsWith('tag/')) return `~/${route.replace('tag/', 'tags/')}`;
    return `~/${route}`;
  };

  useEffect(() => {
    // Initialize theme based on system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (!isA11yMode) {
      document.body.classList.add('font-mode-pixel');
      document.body.classList.remove('font-mode-system');
    } else {
      document.body.classList.add('font-mode-system');
      document.body.classList.remove('font-mode-pixel');
    }
  }, [isA11yMode]);

  useEffect(() => {
    // Boot sequence simulation
    const bootSequence = [
      "BIOS Date 02/23/26 23:09:12 Ver 08.00.15",
      "CPU: Quantum Processor @ 4.2GHz",
      "Memory Test: 64000K OK",
      "Initializing USB Controllers .. Done.",
      "Loading OS...",
      "Mounting virtual file system...",
      "Starting user session...",
      "Welcome."
    ];

    let i = 0;
    const interval = setInterval(() => {
      setBootText(prev => prev + bootSequence[i] + '\n');
      i++;
      if (i >= bootSequence.length) {
        clearInterval(interval);
        setTimeout(() => setBooting(false), 500);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [route, bootText]);

  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const cmd = input.trim();
      const parts = cmd.split(' ');
      
      if (parts.length === 1) {
        // Autocomplete commands
        const commands = ['ls', 'dir', 'cd', 'pwd', 'cat', 'clear', 'echo', 'whoami', 'date', 'help'];
        const matches = commands.filter(c => c.startsWith(parts[0].toLowerCase()));
        if (matches.length === 1) {
          setInput(matches[0] + ' ');
        } else if (matches.length > 1) {
          setTerminalOutput(prev => [...prev, 
            { type: 'cmd', text: `guest@server:${getPromptPath()} $ ${cmd}` },
            { type: 'out', text: matches.join('  ') }
          ]);
        }
      } else if (parts.length === 2 && (parts[0].toLowerCase() === 'cd' || parts[0].toLowerCase() === 'cat')) {
        // Autocomplete files/directories
        const prefix = parts[1].toLowerCase();
        let options: string[] = [];
        
        if (parts[0].toLowerCase() === 'cd') {
          if (route === 'home') {
            const categories = Array.from(new Set(POSTS.map(p => p.category.toLowerCase())));
            const tags = Array.from(new Set(POSTS.flatMap(p => p.tags.map(t => t.toLowerCase()))));
            options = [
              'posts', 'categories', 'tags', 'about', '~', '..',
              ...categories.map(c => `categories/${c}`),
              ...tags.map(t => `tags/${t}`)
            ];
          } else if (route === 'categories') {
            options = ['~', '..', ...Array.from(new Set(POSTS.map(p => p.category.toLowerCase())))];
          } else if (route === 'tags') {
            options = ['~', '..', ...Array.from(new Set(POSTS.flatMap(p => p.tags.map(t => t.toLowerCase()))))];
          } else {
            options = ['~', '..'];
          }
        } else if (parts[0].toLowerCase() === 'cat') {
          if (route === 'home') {
            options = ['about.txt', 'welcome.sh'];
          } else if (route === 'posts') {
            options = POSTS.map(p => `${p.id}.md`);
          } else if (route === 'categories' || route === 'tags') {
            options = [];
          } else if (route.startsWith('category/')) {
            const cat = route.split('/')[1];
            options = POSTS.filter(p => p.category.toLowerCase() === cat).map(p => `${p.id}.md`);
          } else if (route.startsWith('tag/')) {
            const tag = route.split('/')[1];
            options = POSTS.filter(p => p.tags.map(t => t.toLowerCase()).includes(tag)).map(p => `${p.id}.md`);
          } else if (route === 'about') {
            options = ['about.txt'];
          } else {
            options = ['about.txt', 'welcome.sh', ...POSTS.map(p => `${p.id}.md`)];
          }
        }
        
        const matches = options.filter(o => o.startsWith(prefix));
        if (matches.length === 1) {
          setInput(`${parts[0]} ${matches[0]}`);
        } else if (matches.length > 1) {
          setTerminalOutput(prev => [...prev, 
            { type: 'cmd', text: `guest@server:${getPromptPath()} $ ${cmd}` },
            { type: 'out', text: matches.join('  ') }
          ]);
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIndex = historyIndex < cmdHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIndex);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Enter') {
      const cmd = input.trim();
      const cmdLower = cmd.toLowerCase();
      
      if (cmd) {
        setCmdHistory(prev => [...prev, cmd]);
        setHistoryIndex(-1);
        setTerminalOutput(prev => [...prev, { type: 'cmd', text: `guest@server:${getPromptPath()} $ ${cmd}` }]);
      }
      
      setInput('');
      
      if (!cmd) return;

      let outputText = '';
      let isError = false;
      
      if (cmdLower === 'clear') {
        setTerminalOutput([]);
        return;
      } else if (cmdLower === 'ls' || cmdLower === 'dir') {
        if (route === 'home') {
          outputText = 'posts/\ncategories/\ntags/\nabout.txt\nwelcome.sh';
        } else if (route === 'posts') {
          outputText = POSTS.map(p => `${p.id}.md`).join('\n');
        } else if (route === 'categories') {
          const categories = Array.from(new Set(POSTS.map(p => p.category.toLowerCase())));
          outputText = categories.map(c => `${c}/`).join('\n');
        } else if (route === 'tags') {
          const tags = Array.from(new Set(POSTS.flatMap(p => p.tags.map(t => t.toLowerCase()))));
          outputText = tags.map(t => `${t}/`).join('\n');
        } else if (route.startsWith('category/')) {
          const cat = route.split('/')[1];
          outputText = POSTS.filter(p => p.category.toLowerCase() === cat).map(p => `${p.id}.md`).join('\n');
        } else if (route.startsWith('tag/')) {
          const tag = route.split('/')[1];
          outputText = POSTS.filter(p => p.tags.map(t => t.toLowerCase()).includes(tag)).map(p => `${p.id}.md`).join('\n');
        } else {
          outputText = 'posts/\ncategories/\ntags/\nabout.txt\nwelcome.sh';
        }
      } else if (cmdLower.startsWith('cd ')) {
        const target = cmdLower.substring(3).trim();
        if (target === '~' || target === '/') {
          setRoute('home');
          outputText = 'Changed directory to /home/guest';
        } else if (target === '..') {
          if (route.startsWith('post/')) {
            setRoute('posts');
            outputText = 'Changed directory to /home/guest/posts';
          } else if (route.startsWith('category/')) {
            setRoute('categories');
            outputText = 'Changed directory to /home/guest/categories';
          } else if (route.startsWith('tag/')) {
            setRoute('tags');
            outputText = 'Changed directory to /home/guest/tags';
          } else if (route !== 'home') {
            setRoute('home');
            outputText = 'Changed directory to /home/guest';
          } else {
            outputText = 'Already at root directory.';
          }
        } else if (target === 'posts' || target === './posts' || target === 'posts/') {
          setRoute('posts');
          outputText = 'Changed directory to /home/guest/posts';
        } else if (target === 'categories' || target === './categories' || target === 'categories/') {
          setRoute('categories');
          outputText = 'Changed directory to /home/guest/categories';
        } else if (target === 'tags' || target === './tags' || target === 'tags/') {
          setRoute('tags');
          outputText = 'Changed directory to /home/guest/tags';
        } else if (target === 'about' || target === './about' || target === 'about/') {
          setRoute('about');
          outputText = 'Changed directory to /home/guest/about';
        } else if (target.startsWith('categories/')) {
          const cat = target.split('/')[1].toLowerCase();
          const categories = Array.from(new Set(POSTS.map(p => p.category.toLowerCase())));
          if (categories.includes(cat)) {
            setRoute(`category/${cat}`);
            outputText = `Changed directory to /home/guest/categories/${cat}`;
          } else {
            outputText = `cd: ${target}: No such file or directory`;
            isError = true;
          }
        } else if (target.startsWith('tags/')) {
          const tag = target.split('/')[1].toLowerCase();
          const tags = Array.from(new Set(POSTS.flatMap(p => p.tags.map(t => t.toLowerCase()))));
          if (tags.includes(tag)) {
            setRoute(`tag/${tag}`);
            outputText = `Changed directory to /home/guest/tags/${tag}`;
          } else {
            outputText = `cd: ${target}: No such file or directory`;
            isError = true;
          }
        } else if (route === 'categories') {
          const categories = Array.from(new Set(POSTS.map(p => p.category.toLowerCase())));
          if (categories.includes(target.toLowerCase())) {
            setRoute(`category/${target.toLowerCase()}`);
            outputText = `Changed directory to /home/guest/categories/${target.toLowerCase()}`;
          } else {
            outputText = `cd: ${target}: No such file or directory`;
            isError = true;
          }
        } else if (route === 'tags') {
          const tags = Array.from(new Set(POSTS.flatMap(p => p.tags.map(t => t.toLowerCase()))));
          if (tags.includes(target.toLowerCase())) {
            setRoute(`tag/${target.toLowerCase()}`);
            outputText = `Changed directory to /home/guest/tags/${target.toLowerCase()}`;
          } else {
            outputText = `cd: ${target}: No such file or directory`;
            isError = true;
          }
        } else {
          outputText = `cd: ${target}: No such file or directory`;
          isError = true;
        }
      } else if (cmdLower === 'cd') {
        setRoute('home');
        outputText = 'Changed directory to /home/guest';
      } else if (cmdLower === 'pwd') {
        if (route === 'home') outputText = '/home/guest';
        else if (route === 'posts') outputText = '/home/guest/posts';
        else if (route === 'categories') outputText = '/home/guest/categories';
        else if (route === 'tags') outputText = '/home/guest/tags';
        else if (route === 'about') outputText = '/home/guest/about';
        else if (route.startsWith('post/')) outputText = `/home/guest/posts/${route.split('/')[1]}`;
        else if (route.startsWith('category/')) outputText = `/home/guest/categories/${route.split('/')[1]}`;
        else if (route.startsWith('tag/')) outputText = `/home/guest/tags/${route.split('/')[1]}`;
      } else if (cmdLower.startsWith('echo ')) {
        outputText = cmd.substring(5);
      } else if (cmdLower === 'whoami') {
        outputText = 'guest';
      } else if (cmdLower === 'date') {
        outputText = new Date().toString();
      } else if (cmdLower.startsWith('cat ')) {
        const file = cmdLower.replace('cat ', '').replace('.md', '').replace('.txt', '');
        if (file === 'about') {
          setRoute('about');
          outputText = 'Reading about.txt...';
        } else if (file === 'welcome.sh' || file === 'welcome') {
          setRoute('home');
          outputText = 'Executing welcome.sh...';
        } else {
          const post = POSTS.find(p => p.id === file);
          if (post) {
            setRoute(`post/${post.id}`);
            outputText = `Reading ${post.id}.md...`;
          } else {
            outputText = `cat: ${file}: No such file or directory`;
            isError = true;
          }
        }
      } else if (cmdLower === 'help') {
        outputText = "Available commands:\n  cd <dir>   - Change directory (home, posts, categories, tags, about, ..)\n  ls         - List directory contents\n  pwd        - Print working directory\n  cat <file> - Read a file\n  clear      - Clear terminal output\n  echo <txt> - Print text\n  whoami     - Print current user\n  date       - Print current date/time\n  help       - Show this help message";
      } else {
        outputText = `bash: ${cmd}: command not found`;
        isError = true;
      }

      if (outputText) {
        setTerminalOutput(prev => [...prev, { type: isError ? 'err' : 'out', text: outputText }]);
      }
    }
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-[#050505] text-blue-600 dark:text-green-500 font-console p-8 flex flex-col crt-flicker">
        <div className="scanlines"></div>
        <pre className="text-xl whitespace-pre-wrap">{bootText}</pre>
        <div className="blinking-cursor mt-2"></div>
      </div>
    );
  }

  const renderContent = () => {
    if (route === 'home') {
      return (
        <div className="animate-in fade-in duration-300">
          <p className="text-blue-600 dark:text-green-400 mb-4">$ ./welcome.sh</p>
          <h1 className="text-4xl font-pixel text-gray-900 dark:text-white mb-4 text-glow-white">SYSTEM ONLINE</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-2">Welcome to my personal server.</p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Type 'help' or click around to navigate.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg max-w-2xl mb-8 p-4 border border-gray-300 dark:border-[#333] bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="flex"><span className="text-gray-500 w-24">OS:</span><span className="text-blue-600 dark:text-green-300">Debian GNU/Linux 12</span></div>
            <div className="flex"><span className="text-gray-500 w-24">Kernel:</span><span className="text-blue-600 dark:text-green-300">6.1.0-18-amd64</span></div>
            <div className="flex"><span className="text-gray-500 w-24">Uptime:</span><span className="text-blue-600 dark:text-green-300">94 days, 12:34</span></div>
            <div className="flex"><span className="text-gray-500 w-24">Packages:</span><span className="text-blue-600 dark:text-green-300">1423 (dpkg)</span></div>
            <div className="flex"><span className="text-gray-500 w-24">Shell:</span><span className="text-blue-600 dark:text-green-300">zsh 5.9</span></div>
            <div className="flex"><span className="text-gray-500 w-24">Terminal:</span><span className="text-blue-600 dark:text-green-300">xterm-256color</span></div>
          </div>
          
          <p className="text-yellow-600 dark:text-yellow-400 mb-4 font-pixel">LATEST_POST.md</p>
          <div 
            className="border border-gray-300 dark:border-[#333] bg-white dark:bg-[#111] p-4 cursor-pointer hover:border-blue-500 dark:hover:border-green-500 transition-colors group"
            onClick={() => setRoute(`post/${POSTS[0].id}`)}
          >
            <h3 className="text-2xl font-pixel text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-green-400 mb-2">{POSTS[0].title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{POSTS[0].date} | {POSTS[0].category} | {POSTS[0].tags.join(', ')}</p>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{POSTS[0].content}</p>
          </div>
        </div>
      );
    }

    if (route === 'categories') {
      const categories = Array.from(new Set(POSTS.map(p => p.category.toLowerCase())));
      return (
        <div className="animate-in fade-in duration-300">
          <p className="text-blue-600 dark:text-green-400 mb-6">$ ls -la ~/categories</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 text-gray-500 border-b border-gray-300 dark:border-[#333] pb-2 mb-2 font-bold">
              <span className="w-24">PERMISSIONS</span>
              <span className="w-16">OWNER</span>
              <span className="w-24">ITEMS</span>
              <span>NAME</span>
            </div>
            {categories.map(cat => {
              const count = POSTS.filter(p => p.category.toLowerCase() === cat).length;
              return (
                <div 
                  key={cat} 
                  className="group cursor-pointer flex flex-col md:flex-row md:items-center gap-2 md:gap-4 py-2 hover:bg-gray-200 dark:hover:bg-[#111] px-2 -mx-2 rounded transition-colors" 
                  onClick={() => setRoute(`category/${cat}`)}
                >
                  <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    <span className="text-blue-500 dark:text-blue-400 w-24">drwxr-xr-x</span>
                    <span className="text-green-600 w-16">guest</span>
                    <span className="w-24">{count} items</span>
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <span className="text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-green-400 flex items-center gap-2 text-xl">
                      <Folder size={18} className="inline text-gray-500 group-hover:text-blue-600 dark:group-hover:text-green-400" />
                      {cat}/
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (route === 'tags') {
      const tags = Array.from(new Set(POSTS.flatMap(p => p.tags.map(t => t.toLowerCase()))));
      return (
        <div className="animate-in fade-in duration-300">
          <p className="text-blue-600 dark:text-green-400 mb-6">$ ls -la ~/tags</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 text-gray-500 border-b border-gray-300 dark:border-[#333] pb-2 mb-2 font-bold">
              <span className="w-24">PERMISSIONS</span>
              <span className="w-16">OWNER</span>
              <span className="w-24">ITEMS</span>
              <span>NAME</span>
            </div>
            {tags.map(tag => {
              const count = POSTS.filter(p => p.tags.map(t => t.toLowerCase()).includes(tag)).length;
              return (
                <div 
                  key={tag} 
                  className="group cursor-pointer flex flex-col md:flex-row md:items-center gap-2 md:gap-4 py-2 hover:bg-gray-200 dark:hover:bg-[#111] px-2 -mx-2 rounded transition-colors" 
                  onClick={() => setRoute(`tag/${tag}`)}
                >
                  <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    <span className="text-blue-500 dark:text-blue-400 w-24">drwxr-xr-x</span>
                    <span className="text-green-600 w-16">guest</span>
                    <span className="w-24">{count} items</span>
                  </div>
                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <span className="text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-green-400 flex items-center gap-2 text-xl">
                      <Folder size={18} className="inline text-gray-500 group-hover:text-blue-600 dark:group-hover:text-green-400" />
                      {tag}/
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (route === 'posts' || route.startsWith('category/') || route.startsWith('tag/')) {
      let displayPosts = POSTS;
      let dirName = '~/posts';
      
      if (route.startsWith('category/')) {
        const cat = route.split('/')[1];
        displayPosts = POSTS.filter(p => p.category.toLowerCase() === cat);
        dirName = `~/categories/${cat}`;
      } else if (route.startsWith('tag/')) {
        const tag = route.split('/')[1];
        displayPosts = POSTS.filter(p => p.tags.map(t => t.toLowerCase()).includes(tag));
        dirName = `~/tags/${tag}`;
      }

      return (
        <div className="animate-in fade-in duration-300">
          <p className="text-blue-600 dark:text-green-400 mb-6">$ ls -la {dirName}</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 text-gray-500 border-b border-gray-300 dark:border-[#333] pb-2 mb-2 font-bold">
              <span className="w-24">PERMISSIONS</span>
              <span className="w-16">OWNER</span>
              <span className="w-24">DATE</span>
              <span>NAME</span>
            </div>
            {displayPosts.map(post => (
              <div 
                key={post.id} 
                className="group cursor-pointer flex flex-col md:flex-row md:items-center gap-2 md:gap-4 py-2 hover:bg-gray-200 dark:hover:bg-[#111] px-2 -mx-2 rounded transition-colors" 
                onClick={() => setRoute(`post/${post.id}`)}
              >
                <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  <span className="text-blue-500 dark:text-blue-400 w-24">-rw-r--r--</span>
                  <span className="text-green-600 w-16">guest</span>
                  <span className="w-24">{post.date}</span>
                </div>
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <span className="text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-green-400 flex items-center gap-2 text-xl">
                    <FileText size={18} className="inline text-gray-500 group-hover:text-blue-600 dark:group-hover:text-green-400" />
                    {post.id}.md
                  </span>
                  <span className="text-sm text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 md:text-right">
                    # {post.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {(route.startsWith('category/') || route.startsWith('tag/')) && (
            <button 
              onClick={() => setRoute(route.startsWith('category/') ? 'categories' : 'tags')} 
              className="mt-6 text-blue-600 dark:text-green-500 hover:text-gray-900 dark:hover:text-white hover:bg-blue-100 dark:hover:bg-green-900/30 px-4 py-2 rounded flex items-center gap-2 transition-colors border border-transparent hover:border-blue-500/50 dark:hover:border-green-500/50"
            >
              <ChevronRight size={18} /> cd ../
            </button>
          )}
        </div>
      );
    }

    if (route.startsWith('post/')) {
      const post = POSTS.find(p => p.id === route.split('/')[1]);
      if (!post) return <div className="text-red-500">Error: File not found.</div>;
      
      return (
        <div className="animate-in fade-in duration-300">
          <p className="text-blue-600 dark:text-green-400 mb-6">$ cat ~/posts/{post.id}.md</p>
          <div className="border border-gray-300 dark:border-[#333] bg-gray-50 dark:bg-[#0a0a0a] p-6 md:p-8 text-gray-700 dark:text-gray-300 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 dark:from-green-500/50 to-transparent"></div>
            <h1 className="text-3xl md:text-5xl font-pixel text-gray-900 dark:text-white mb-4 text-glow-white">{post.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8 border-b border-gray-300 dark:border-[#333] pb-4">
              <span className="bg-white dark:bg-[#111] px-2 py-1 rounded border border-gray-200 dark:border-[#222]">DATE: {post.date}</span>
              <span 
                className="bg-white dark:bg-[#111] px-2 py-1 rounded border border-gray-200 dark:border-[#222] cursor-pointer hover:border-blue-500 dark:hover:border-green-500 hover:text-blue-600 dark:hover:text-green-400 transition-colors"
                onClick={() => setRoute(`category/${post.category.toLowerCase()}`)}
              >
                CATEGORY: {post.category}
              </span>
              <span className="bg-white dark:bg-[#111] px-2 py-1 rounded border border-gray-200 dark:border-[#222] flex gap-1">
                TAGS: {post.tags.map((tag, idx) => (
                  <span key={tag}>
                    <span 
                      className="cursor-pointer hover:text-blue-600 dark:hover:text-green-400 transition-colors"
                      onClick={() => setRoute(`tag/${tag.toLowerCase()}`)}
                    >
                      {tag}
                    </span>
                    {idx < post.tags.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </span>
            </div>
            <div className="prose dark:prose-invert prose-p:font-console prose-headings:font-pixel max-w-none text-xl leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
          <button 
            onClick={() => setRoute('posts')} 
            className="mt-6 text-blue-600 dark:text-green-500 hover:text-gray-900 dark:hover:text-white hover:bg-blue-100 dark:hover:bg-green-900/30 px-4 py-2 rounded flex items-center gap-2 transition-colors border border-transparent hover:border-blue-500/50 dark:hover:border-green-500/50"
          >
            <ChevronRight size={18} /> cd ../
          </button>
        </div>
      );
    }

    if (route === 'about') {
      return (
        <div className="animate-in fade-in duration-300">
          <p className="text-blue-600 dark:text-green-400 mb-6">$ cat ~/about.txt</p>
          <div className="flex flex-col lg:flex-row gap-8 items-start border border-gray-300 dark:border-[#333] bg-gray-50 dark:bg-[#0a0a0a] p-6 md:p-8">
            <div className="bg-white dark:bg-[#111] p-4 border border-gray-200 dark:border-[#222] rounded shadow-inner">
              <pre className="text-blue-600 dark:text-green-500 text-xs leading-none font-bold">
{`
      _.-'''''-._
    .'  _     _  '.
   /   (o)   (o)   \\
  |                 |
  |  \\           /  |
   \\  '.       .'  /
    '.  \`'---'\`  .'
      '-._____.-'
`}
              </pre>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-pixel text-gray-900 dark:text-white mb-6 border-b border-gray-300 dark:border-[#333] pb-2">ABOUT_ME</h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Hi, I'm a developer who loves retro aesthetics, pixel art, and building things from scratch.
              </p>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                I specialize in creating web experiences that don't just look like standard corporate templates. I believe the web should be fun, weird, and personal.
              </p>
              <div className="mt-8">
                <h3 className="text-xl font-pixel text-blue-600 dark:text-green-400 mb-4">SKILLS</h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Rust', 'TailwindCSS', 'Pixel Art', 'Linux'].map(skill => (
                    <span key={skill} className="bg-white dark:bg-[#111] border border-gray-300 dark:border-[#333] px-3 py-1 text-gray-700 dark:text-gray-300 text-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return <div className="text-red-500">Command not found or route invalid.</div>;
  };

  return (
    <div 
      className={`min-h-screen bg-gray-100 dark:bg-[#050505] text-gray-900 dark:text-[#e5e5e5] font-console p-2 md:p-6 flex items-center justify-center relative overflow-hidden ${isA11yMode ? '' : 'crt-flicker'}`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="scanlines"></div>
      
      <div className="w-full max-w-7xl h-[95vh] flex flex-col md:flex-row gap-4 relative z-10">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-4 shrink-0">
          {/* Profile Box */}
          <div className="pixel-panel p-4 flex flex-col items-center text-center">
             <pre className="text-[10px] leading-none mb-4 text-blue-600 dark:text-green-500 font-bold">
{`
  _____ 
 /     \\
| () () |
 \\  ^  / 
  |||||  
  |||||  
`}
             </pre>
             <h1 className="font-pixel text-xl text-gray-900 dark:text-white mb-1 text-glow-white">GUEST_USER</h1>
             <p className="text-sm text-blue-600 dark:text-green-600 mb-4">Level 42 Developer</p>
             
             <div className="w-full h-px bg-gray-300 dark:bg-[#333] my-2"></div>
             
             <div className="flex flex-col w-full text-left gap-1 mt-2">
               <button 
                 onClick={() => setRoute('home')} 
                 className={`pixel-btn px-3 py-2 flex items-center gap-3 text-lg ${route === 'home' ? 'bg-blue-100 dark:bg-green-900/40 text-blue-600 dark:text-green-400 border-l-2 border-blue-500 dark:border-green-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
               >
                 <Terminal size={18} /> ~/home
               </button>
               <button 
                 onClick={() => setRoute('posts')} 
                 className={`pixel-btn px-3 py-2 flex items-center gap-3 text-lg ${route.startsWith('post') ? 'bg-blue-100 dark:bg-green-900/40 text-blue-600 dark:text-green-400 border-l-2 border-blue-500 dark:border-green-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
               >
                 <Folder size={18} /> ~/posts
               </button>
               <button 
                 onClick={() => setRoute('categories')} 
                 className={`pixel-btn px-3 py-2 flex items-center gap-3 text-lg ${route.startsWith('categor') ? 'bg-blue-100 dark:bg-green-900/40 text-blue-600 dark:text-green-400 border-l-2 border-blue-500 dark:border-green-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
               >
                 <Layers size={18} /> ~/categories
               </button>
               <button 
                 onClick={() => setRoute('tags')} 
                 className={`pixel-btn px-3 py-2 flex items-center gap-3 text-lg ${route.startsWith('tag') ? 'bg-blue-100 dark:bg-green-900/40 text-blue-600 dark:text-green-400 border-l-2 border-blue-500 dark:border-green-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
               >
                 <Tag size={18} /> ~/tags
               </button>
               <button 
                 onClick={() => setRoute('about')} 
                 className={`pixel-btn px-3 py-2 flex items-center gap-3 text-lg ${route === 'about' ? 'bg-blue-100 dark:bg-green-900/40 text-blue-600 dark:text-green-400 border-l-2 border-blue-500 dark:border-green-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
               >
                 <User size={18} /> ~/about
               </button>
             </div>
          </div>
          
          {/* Socials Box */}
          <div className="pixel-panel p-4 flex flex-col gap-3">
            <h2 className="font-pixel text-sm text-gray-500 mb-1">NETWORK</h2>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-green-400 flex items-center gap-3 text-lg transition-colors">
              <Github size={18}/> github
            </a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-green-400 flex items-center gap-3 text-lg transition-colors">
              <Twitter size={18}/> twitter
            </a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-green-400 flex items-center gap-3 text-lg transition-colors">
              <Mail size={18}/> email
            </a>
          </div>
          
          <div className="mt-auto text-xs text-gray-500 dark:text-gray-600 text-center font-pixel">
            SYS.VER 1.0.4<br/>
            © 2026
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 pixel-panel flex flex-col overflow-hidden bg-white dark:bg-[#020202]">
          {/* Window Title */}
          <div className="bg-gray-200 dark:bg-[#111] border-b border-gray-300 dark:border-[#333] p-2 flex items-center justify-between select-none">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm font-pixel">
              <Command size={14} />
              <span>guest@server:~/{route.replace('post/', 'posts/')}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2 mr-2">
                <button 
                  onClick={() => setIsA11yMode(!isA11yMode)} 
                  className={`p-1 rounded transition-colors cursor-pointer ${isA11yMode ? 'text-blue-600 dark:text-green-400 bg-gray-300 dark:bg-[#222]' : 'text-gray-500 hover:text-blue-600 dark:hover:text-green-400 hover:bg-gray-300 dark:hover:bg-[#222]'}`}
                  title={isA11yMode ? "Disable Accessibility Mode" : "Enable Accessibility Mode (Disables animations and stylized fonts)"}
                  aria-label="Toggle Accessibility Mode"
                  aria-pressed={isA11yMode}
                >
                  <Accessibility size={16} />
                </button>
                <button 
                  onClick={() => setIsDark(!isDark)} 
                  className="p-1 rounded text-gray-500 hover:text-blue-600 dark:hover:text-green-400 hover:bg-gray-300 dark:hover:bg-[#222] transition-colors cursor-pointer"
                  title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  aria-label="Toggle Theme"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-[#ff5f56] rounded-full"></div>
                <div className="w-3 h-3 bg-[#ffbd2e] rounded-full"></div>
                <div className="w-3 h-3 bg-[#27c93f] rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col" ref={scrollRef}>
            <div className="flex-1">
              {renderContent()}
            </div>
          </div>
          
          {/* Terminal Output Area */}
          <div className="border-t border-gray-300 dark:border-[#333] bg-gray-50 dark:bg-[#0a0a0a] flex flex-col shrink-0">
            {/* Terminal History */}
            <div 
              className={`max-h-48 overflow-y-auto flex flex-col gap-1 text-sm md:text-base px-4 md:px-6 ${terminalOutput.length > 0 ? 'pt-4 pb-2' : 'pt-4 pb-2'}`}
              ref={terminalScrollRef}
            >
              {terminalOutput.map((out, idx) => (
                <div key={idx} className={`whitespace-pre-wrap ${
                  out.type === 'cmd' ? 'text-gray-500 dark:text-gray-400' : 
                  out.type === 'err' ? 'text-red-600 dark:text-red-400' : 
                  'text-gray-700 dark:text-gray-300'
                }`}>
                  {out.text}
                </div>
              ))}
            </div>
            
            {/* Command Prompt */}
            <div className="px-4 md:px-6 pb-4 md:pb-6 flex items-center gap-2 text-xl">
              <span className="text-blue-600 dark:text-green-500 font-bold shrink-0">guest@server:{getPromptPath()} $</span>
              <input 
                ref={inputRef}
                type="text" 
                className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white font-console min-w-0"
                autoFocus
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleCommand}
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
