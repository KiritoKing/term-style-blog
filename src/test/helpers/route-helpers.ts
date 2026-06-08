/**
 * Route parsing and navigation helper functions.
 * Extracted from TerminalPanel component for testability.
 * These are pure functions that can be unit tested independently.
 */

export type RouteContext =
  | { section: 'home' }
  | { section: 'posts' }
  | { section: 'categories' }
  | { section: 'tags' }
  | { section: 'about' }
  | { section: 'search' }
  | { section: 'post'; slug: string }
  | { section: 'category'; slug: string }
  | { section: 'tag'; slug: string };

/**
 * Parses a route string into a RouteContext object.
 */
export function parseRoute(route: string): RouteContext {
  if (route === 'home') return { section: 'home' };
  if (route === 'posts') return { section: 'posts' };
  if (route.startsWith('posts/')) return { section: 'post', slug: route.replace('posts/', '') };
  if (route === 'categories') return { section: 'categories' };
  if (route.startsWith('categories/')) return { section: 'category', slug: route.replace('categories/', '') };
  if (route === 'tags') return { section: 'tags' };
  if (route.startsWith('tags/')) return { section: 'tag', slug: route.replace('tags/', '') };
  if (route === 'about') return { section: 'about' };
  if (route === 'search') return { section: 'search' };
  return { section: 'home' };
}

/**
 * Resolves a RouteContext to a navigation path.
 */
export function resolveNavigationPath(targetRoute: RouteContext): string {
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
    case 'search':
      return '/search';
    case 'post':
      return `/posts/${targetRoute.slug}`;
    case 'category':
      return `/categories/${targetRoute.slug}`;
    case 'tag':
      return `/tags/${targetRoute.slug}`;
    default:
      return '/';
  }
}

/**
 * Gets the prompt path for a given route context.
 */
export function getPromptPath(routeContext: RouteContext): string {
  switch (routeContext.section) {
    case 'home':
      return '/home/guest';
    case 'posts':
      return '/home/guest/posts';
    case 'categories':
      return '/home/guest/categories';
    case 'tags':
      return '/home/guest/tags';
    case 'about':
      return '/home/guest/about';
    case 'search':
      return '/home/guest';
    case 'post':
      return `/home/guest/posts/${routeContext.slug}`;
    case 'category':
      return `/home/guest/categories/${routeContext.slug}`;
    case 'tag':
      return `/home/guest/tags/${routeContext.slug}`;
    default:
      return '/home/guest';
  }
}
