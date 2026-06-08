/**
 * Environment mock utilities for local validation without Notion credentials.
 * 
 * These utilities detect whether the current command context should use
 * fixtures (local validation) or production Notion content.
 */

/**
 * Detects if the current command is a local validation context.
 * Local validation commands should use fixture source instead of Notion.
 */
export function isLocalValidation(): boolean {
  const args = process.argv;
  
  // Check for explicit local validation commands
  const localCommands = [
    'validate:local',
    'test:fixtures',
    'check',       // pnpm astro check
    'sync',        // pagefind sync
  ];
  
  for (const arg of args) {
    for (const cmd of localCommands) {
      if (arg.includes(cmd)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Detects if Notion credentials are available and valid.
 * Returns false if credentials are missing or invalid.
 */
export function hasValidNotionCredentials(): boolean {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  
  if (!token || !databaseId) {
    return false;
  }
  
  // Check for placeholder values
  if (token === '' || databaseId === '' || 
      token === '***' || databaseId === 'invalid' ||
      token === 'YOUR_NOTION_TOKEN' || databaseId === 'YOUR_DATABASE_ID') {
    return false;
  }
  
  return true;
}

/**
 * Determines if the current context should use fixture source.
 * Returns true when local validation is active OR Notion credentials are invalid.
 */
export function shouldUseFixtures(): boolean {
  return isLocalValidation() || !hasValidNotionCredentials();
}

/**
 * Gets the content source mode for the current context.
 */
export type ContentSourceMode = 'notion' | 'fixtures' | 'empty';

export function getContentSourceMode(): ContentSourceMode {
  if (isLocalValidation() || !hasValidNotionCredentials()) {
    return 'fixtures';
  }
  return 'notion';
}