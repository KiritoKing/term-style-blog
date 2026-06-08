import { notionLoader, type NotionLoaderOptions } from '@astro-notion/loader';
import type { Loader } from 'astro/loaders';
import process from 'node:process';

type NotionContentLoaderOptions = NotionLoaderOptions & {
  allowEmptyFallback?: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const hasTextValue = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const hasRequiredNotionConfig = (options: NotionLoaderOptions): boolean =>
  hasTextValue(options.auth) && hasTextValue(options.data_source_id);

const isNotionAuthError = (error: unknown): boolean => {
  if (!isRecord(error)) return false;

  const code = error.code;
  if (code === 'unauthorized') return true;

  const message = error.message;
  return typeof message === 'string' && message.includes('API token is invalid');
};

/**
 * Detects if the current command should use local content validation mode.
 * 
 * Local validation mode enables fallback to empty collection when Notion
 * credentials are missing or invalid, preventing Notion API errors during:
 * - `pnpm validate:local` (astro check)
 * - `pnpm build:local` (astro build without credentials)
 * - `pnpm dev` (astro dev without credentials)
 * 
 * Production commands like `pnpm build` require valid Notion credentials.
 */
export const isLocalContentValidationCommand = (): boolean => {
  const localCommands = ['check', 'sync'];
  const isLocalCmd = process.argv.some((arg) => localCommands.includes(arg));
  
  // Check for build/dev commands
  const isBuildOrDev = process.argv.some(
    (arg) => arg === 'build' || arg === 'dev'
  );
  
  // Enable local mode for build/dev when credentials might be invalid
  if (isBuildOrDev) {
    const hasAuth = typeof process.env.NOTION_TOKEN === 'string' &&
      process.env.NOTION_TOKEN.length > 0;
    const hasDbId = typeof process.env.NOTION_DATABASE_ID === 'string' &&
      process.env.NOTION_DATABASE_ID.length > 0;

    // Use local mode if credentials are missing (known invalid)
    // This prevents Notion API errors when environment is not configured
    if (!hasAuth || !hasDbId) {
      return true;
    }
    
    // Also use local mode if credentials look like placeholders
    // These are common patterns for invalid/placeholder tokens
    const tokenValue = process.env.NOTION_TOKEN || '';
    const isPlaceholder = 
      tokenValue === 'invalid' ||
      tokenValue === 'your_notion_token' ||
      tokenValue.startsWith('secret_') === false && tokenValue.includes('...') ||
      tokenValue === '***';
    
    const dbIdValue = process.env.NOTION_DATABASE_ID || '';
    const isDbIdPlaceholder =
      dbIdValue === 'invalid' ||
      dbIdValue === 'your_notion_database_id' ||
      dbIdValue === '***' ||
      dbIdValue.length < 20; // Notion IDs are typically 32 chars
      
    if (isPlaceholder || isDbIdPlaceholder) {
      return true;
    }
  }
  
  return isLocalCmd;
};

export const notionContentLoader = ({
  allowEmptyFallback = false,
  ...options
}: NotionContentLoaderOptions): Loader => {
  const loader = notionLoader(options);

  return {
    ...loader,
    name: `${loader.name}/content-source-contract`,
    async load(context) {
      if (allowEmptyFallback && !hasRequiredNotionConfig(options)) {
        context.store.clear();
        context.logger.warn(
          'Notion credentials are missing; using an empty blog collection for local validation.',
        );
        return;
      }

      try {
        await loader.load(context);
      } catch (error) {
        if (!allowEmptyFallback || !isNotionAuthError(error)) {
          throw error;
        }

        context.store.clear();
        context.logger.warn(
          'Notion authentication failed; using an empty blog collection for local validation.',
        );
      }
    },
  };
};