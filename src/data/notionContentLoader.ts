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

export const isLocalContentValidationCommand = (): boolean =>
  process.argv.some((arg) => arg === 'check' || arg === 'sync');

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
