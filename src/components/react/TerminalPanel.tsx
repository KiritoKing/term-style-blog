import React, { useEffect, useMemo, useRef, useState } from 'react';

type TerminalLineType = 'cmd' | 'out' | 'err';

interface TerminalLine {
  type: TerminalLineType;
  text: string;
}

interface Props {
  promptPath: string;
  route: string;
  postIndex: PostIndexItem[];
}

interface PostIndexItem {
  id: string;
  category: string;
  tags: string[];
}

type RouteContext =
  | { section: 'home' }
  | { section: 'posts' }
  | { section: 'categories' }
  | { section: 'tags' }
  | { section: 'about' }
  | { section: 'post'; slug: string }
  | { section: 'category'; slug: string }
  | { section: 'tag'; slug: string };

const OUTPUT_KEY = 'tsb:terminal-output';
const HISTORY_KEY = 'tsb:terminal-history';

const parseRoute = (route: string): RouteContext => {
  if (route === 'home') return { section: 'home' };
  if (route === 'posts') return { section: 'posts' };
  if (route.startsWith('posts/')) return { section: 'post', slug: route.replace('posts/', '') };
  if (route === 'categories') return { section: 'categories' };
  if (route.startsWith('categories/')) return { section: 'category', slug: route.replace('categories/', '') };
  if (route === 'tags') return { section: 'tags' };
  if (route.startsWith('tags/')) return { section: 'tag', slug: route.replace('tags/', '') };
  if (route === 'about') return { section: 'about' };
  return { section: 'home' };
};

const getStoredOutput = (): TerminalLine[] | null => {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(OUTPUT_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as TerminalLine[];
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return null;
  }
  return null;
};

const getStoredHistory = (): string[] | null => {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(HISTORY_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as string[];
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return null;
  }
  return null;
};

const persistState = (output: TerminalLine[], history: string[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(OUTPUT_KEY, JSON.stringify(output));
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

const commandList = ['ls', 'dir', 'cd', 'pwd', 'cat', 'clear', 'echo', 'whoami', 'date', 'help'];

export default function TerminalPanel({ promptPath, route, postIndex }: Props) {
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [terminalOutput, setTerminalOutput] = useState<TerminalLine[]>([
    { type: 'out', text: 'Type "help" to see available commands.' },
  ]);

  const terminalScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const categories = useMemo(
    () => Array.from(new Set(postIndex.map((post) => post.category.toLowerCase()))),
    [postIndex],
  );
  const tags = useMemo(
    () =>
      Array.from(
        new Set(postIndex.flatMap((post) => post.tags.map((tag) => tag.toLowerCase()))),
      ),
    [postIndex],
  );
  const routeContext = useMemo(() => parseRoute(route), [route]);

  useEffect(() => {
    const storedOutput = getStoredOutput();
    const storedHistory = getStoredHistory();
    if (storedOutput) {
      setTerminalOutput(storedOutput);
    }
    if (storedHistory) {
      setCmdHistory(storedHistory);
    }
  }, []);

  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const toPrompt = (cmd: string) => `guest@server:${promptPath} $ ${cmd}`;

  const resolveNavigationPath = (targetRoute: RouteContext): string => {
    switch (targetRoute.section) {
      case 'home':
        return '/';
      case 'posts':
        return '/posts';
      case 'categories':
        return '/categories';
      case 'tags':
        return '/tags';
      case 'about':
        return '/about';
      case 'post':
        return `/posts/${targetRoute.slug}`;
      case 'category':
        return `/categories/${targetRoute.slug}`;
      case 'tag':
        return `/tags/${targetRoute.slug}`;
      default:
        return '/';
    }
  };

  const navigate = (targetRoute: RouteContext, output: TerminalLine[], history: string[]) => {
    const nextPath = resolveNavigationPath(targetRoute);
    persistState(output, history);
    window.setTimeout(() => {
      window.location.assign(nextPath);
    }, 80);
  };

  const addOutput = (output: TerminalLine[]) => {
    setTerminalOutput(output);
  };

  const addEntry = (output: TerminalLine[], history: string[]) => {
    addOutput(output);
    persistState(output, history);
  };

  const handleAutocomplete = () => {
    const cmd = input.trim();
    const parts = cmd.split(' ');
    if (parts.length === 1) {
      const matches = commandList.filter((entry) => entry.startsWith(parts[0].toLowerCase()));
      if (matches.length === 1) {
        setInput(`${matches[0]} `);
        return;
      }
      if (matches.length > 1) {
        const output: TerminalLine[] = [
          ...terminalOutput,
          { type: 'cmd', text: toPrompt(cmd) },
          { type: 'out', text: matches.join('  ') },
        ];
        addEntry(output, cmdHistory);
      }
      return;
    }

    if (parts.length === 2 && (parts[0].toLowerCase() === 'cd' || parts[0].toLowerCase() === 'cat')) {
      const prefix = parts[1].toLowerCase();
      let options: string[] = [];
      if (parts[0].toLowerCase() === 'cd') {
        if (routeContext.section === 'home') {
          options = [
            'posts',
            'categories',
            'tags',
            'about',
            '~',
            '..',
            ...categories.map((entry) => `categories/${entry}`),
            ...tags.map((entry) => `tags/${entry}`),
          ];
        } else if (routeContext.section === 'categories') {
          options = ['~', '..', ...categories];
        } else if (routeContext.section === 'tags') {
          options = ['~', '..', ...tags];
        } else {
          options = ['~', '..'];
        }
      } else if (parts[0].toLowerCase() === 'cat') {
        if (routeContext.section === 'home') {
          options = ['about.txt', 'welcome.sh'];
        } else if (routeContext.section === 'posts') {
          options = postIndex.map((post) => `${post.id}.md`);
        } else if (routeContext.section === 'category') {
          options = postIndex
            .filter((post) => post.category.toLowerCase() === routeContext.slug)
            .map((post) => `${post.id}.md`);
        } else if (routeContext.section === 'tag') {
          options = postIndex
            .filter((post) => post.tags.map((tag) => tag.toLowerCase()).includes(routeContext.slug))
            .map((post) => `${post.id}.md`);
        } else if (routeContext.section === 'about') {
          options = ['about.txt'];
        } else {
          options = ['about.txt', 'welcome.sh', ...postIndex.map((post) => `${post.id}.md`)];
        }
      }
      const matches = options.filter((entry) => entry.startsWith(prefix));
      if (matches.length === 1) {
        setInput(`${parts[0]} ${matches[0]}`);
      } else if (matches.length > 1) {
        const output: TerminalLine[] = [
          ...terminalOutput,
          { type: 'cmd', text: toPrompt(cmd) },
          { type: 'out', text: matches.join('  ') },
        ];
        addEntry(output, cmdHistory);
      }
    }
  };

  const handleHistory = (direction: 'up' | 'down') => {
    if (cmdHistory.length === 0) return;
    if (direction === 'up') {
      const nextIndex = historyIndex < cmdHistory.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIndex);
      setInput(cmdHistory[cmdHistory.length - 1 - nextIndex]);
    } else {
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const handleCommand = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      handleAutocomplete();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      handleHistory('up');
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      handleHistory('down');
      return;
    }

    if (event.key !== 'Enter') return;

    const cmd = input.trim();
    const cmdLower = cmd.toLowerCase();
    const hasCommand = cmd.length > 0;

    let nextHistory = cmdHistory;
    let nextOutput = terminalOutput;

    if (hasCommand) {
      nextHistory = [...cmdHistory, cmd];
      nextOutput = [...terminalOutput, { type: 'cmd', text: toPrompt(cmd) }];
    }

    setCmdHistory(nextHistory);
    setHistoryIndex(-1);
    setInput('');

    if (!hasCommand) {
      addEntry(nextOutput, nextHistory);
      return;
    }

    if (cmdLower === 'clear') {
      addEntry([], nextHistory);
      return;
    }

    let outputText = '';
    let isError = false;
    let nextRoute: RouteContext | null = null;

    if (cmdLower === 'ls' || cmdLower === 'dir') {
      if (routeContext.section === 'home') {
        outputText = 'posts/\ncategories/\ntags/\nabout.txt\nwelcome.sh';
      } else if (routeContext.section === 'posts') {
        outputText = postIndex.map((post) => `${post.id}.md`).join('\n');
      } else if (routeContext.section === 'categories') {
        outputText = categories.map((entry) => `${entry}/`).join('\n');
      } else if (routeContext.section === 'tags') {
        outputText = tags.map((entry) => `${entry}/`).join('\n');
      } else if (routeContext.section === 'category') {
        outputText = postIndex
          .filter((post) => post.category.toLowerCase() === routeContext.slug)
          .map((post) => `${post.id}.md`)
          .join('\n');
      } else if (routeContext.section === 'tag') {
        outputText = postIndex
          .filter((post) => post.tags.map((tag) => tag.toLowerCase()).includes(routeContext.slug))
          .map((post) => `${post.id}.md`)
          .join('\n');
      } else {
        outputText = 'posts/\ncategories/\ntags/\nabout.txt\nwelcome.sh';
      }
    } else if (cmdLower.startsWith('cd ')) {
      const target = cmdLower.substring(3).trim();
      if (target === '~' || target === '/') {
        nextRoute = { section: 'home' };
        outputText = 'Changed directory to /home/guest';
      } else if (target === '..') {
        if (routeContext.section === 'post') {
          nextRoute = { section: 'posts' };
          outputText = 'Changed directory to /home/guest/posts';
        } else if (routeContext.section === 'category') {
          nextRoute = { section: 'categories' };
          outputText = 'Changed directory to /home/guest/categories';
        } else if (routeContext.section === 'tag') {
          nextRoute = { section: 'tags' };
          outputText = 'Changed directory to /home/guest/tags';
        } else if (routeContext.section !== 'home') {
          nextRoute = { section: 'home' };
          outputText = 'Changed directory to /home/guest';
        } else {
          outputText = 'Already at root directory.';
        }
      } else if (target === 'posts' || target === './posts' || target === 'posts/') {
        nextRoute = { section: 'posts' };
        outputText = 'Changed directory to /home/guest/posts';
      } else if (target === 'categories' || target === './categories' || target === 'categories/') {
        nextRoute = { section: 'categories' };
        outputText = 'Changed directory to /home/guest/categories';
      } else if (target === 'tags' || target === './tags' || target === 'tags/') {
        nextRoute = { section: 'tags' };
        outputText = 'Changed directory to /home/guest/tags';
      } else if (target === 'about' || target === './about' || target === 'about/') {
        nextRoute = { section: 'about' };
        outputText = 'Changed directory to /home/guest/about';
      } else if (target.startsWith('categories/')) {
        const slug = target.split('/')[1]?.toLowerCase();
        if (slug && categories.includes(slug)) {
          nextRoute = { section: 'category', slug };
          outputText = `Changed directory to /home/guest/categories/${slug}`;
        } else {
          outputText = `cd: ${target}: No such file or directory`;
          isError = true;
        }
      } else if (target.startsWith('tags/')) {
        const slug = target.split('/')[1]?.toLowerCase();
        if (slug && tags.includes(slug)) {
          nextRoute = { section: 'tag', slug };
          outputText = `Changed directory to /home/guest/tags/${slug}`;
        } else {
          outputText = `cd: ${target}: No such file or directory`;
          isError = true;
        }
      } else if (routeContext.section === 'categories') {
        if (categories.includes(target.toLowerCase())) {
          nextRoute = { section: 'category', slug: target.toLowerCase() };
          outputText = `Changed directory to /home/guest/categories/${target.toLowerCase()}`;
        } else {
          outputText = `cd: ${target}: No such file or directory`;
          isError = true;
        }
      } else if (routeContext.section === 'tags') {
        if (tags.includes(target.toLowerCase())) {
          nextRoute = { section: 'tag', slug: target.toLowerCase() };
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
      nextRoute = { section: 'home' };
      outputText = 'Changed directory to /home/guest';
    } else if (cmdLower === 'pwd') {
      if (routeContext.section === 'home') outputText = '/home/guest';
      else if (routeContext.section === 'posts') outputText = '/home/guest/posts';
      else if (routeContext.section === 'categories') outputText = '/home/guest/categories';
      else if (routeContext.section === 'tags') outputText = '/home/guest/tags';
      else if (routeContext.section === 'about') outputText = '/home/guest/about';
      else if (routeContext.section === 'post') outputText = `/home/guest/posts/${routeContext.slug}`;
      else if (routeContext.section === 'category') outputText = `/home/guest/categories/${routeContext.slug}`;
      else if (routeContext.section === 'tag') outputText = `/home/guest/tags/${routeContext.slug}`;
    } else if (cmdLower.startsWith('echo ')) {
      outputText = cmd.substring(5);
    } else if (cmdLower === 'whoami') {
      outputText = 'guest';
    } else if (cmdLower === 'date') {
      outputText = new Date().toString();
    } else if (cmdLower.startsWith('cat ')) {
      const file = cmdLower.replace('cat ', '').replace('.md', '').replace('.txt', '');
      if (file === 'about') {
        nextRoute = { section: 'about' };
        outputText = 'Reading about.txt...';
      } else if (file === 'welcome.sh' || file === 'welcome') {
        nextRoute = { section: 'home' };
        outputText = 'Executing welcome.sh...';
      } else {
        const post = postIndex.find((entry) => entry.id === file);
        if (post) {
          nextRoute = { section: 'post', slug: post.id };
          outputText = `Reading ${post.id}.md...`;
        } else {
          outputText = `cat: ${file}: No such file or directory`;
          isError = true;
        }
      }
    } else if (cmdLower === 'help') {
      outputText =
        'Available commands:\n  cd <dir>   - Change directory (home, posts, categories, tags, about, ..)\n  ls         - List directory contents\n  pwd        - Print working directory\n  cat <file> - Read a file\n  clear      - Clear terminal output\n  echo <txt> - Print text\n  whoami     - Print current user\n  date       - Print current date/time\n  help       - Show this help message';
    } else {
      outputText = `bash: ${cmd}: command not found`;
      isError = true;
    }

    if (outputText) {
      nextOutput = [
        ...nextOutput,
        { type: isError ? 'err' : 'out', text: outputText },
      ];
    }

    addEntry(nextOutput, nextHistory);

    if (nextRoute) {
      navigate(nextRoute, nextOutput, nextHistory);
    }
  };

  return (
    <div className="border-t border-gray-300 dark:border-[#333] bg-gray-50 dark:bg-[#0a0a0a] flex flex-col shrink-0">
      <div
        className="max-h-48 overflow-y-auto flex flex-col gap-1 text-sm md:text-base px-4 md:px-6 pt-4 pb-2"
        ref={terminalScrollRef}
      >
        {terminalOutput.map((line, index) => (
          <div
            key={`${line.type}-${index}`}
            className={`whitespace-pre-wrap ${
              line.type === 'cmd'
                ? 'text-gray-500 dark:text-gray-400'
                : line.type === 'err'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {line.text}
          </div>
        ))}
      </div>
      <div className="px-4 md:px-6 pb-4 md:pb-6 flex items-center gap-2 text-xl">
        <span className="text-blue-600 dark:text-green-500 font-bold shrink-0">
          guest@server:{promptPath} $
        </span>
        <input
          ref={inputRef}
          id="terminal-input"
          name="terminalCommand"
          type="text"
          className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white font-console min-w-0"
          autoComplete="off"
          spellCheck={false}
          aria-label="Terminal command input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleCommand}
        />
      </div>
    </div>
  );
}
