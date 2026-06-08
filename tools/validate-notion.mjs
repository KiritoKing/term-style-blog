#!/usr/bin/env node
/**
 * tools/validate-notion.mjs
 * 
 * Explicitly validates Notion API credentials.
 * This is the ONLY command that should attempt real Notion API calls.
 * 
 * Usage:
 *   node tools/validate-notion.mjs           # full validation
 *   node tools/validate-notion.mjs --env     # env check only
 */

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function log(msg, color = RESET) {
  console.log(`${color}${msg}${RESET}`);
}

function logSuccess(msg) { log(`✓ ${msg}`, GREEN); }
function logError(msg) { log(`✗ ${msg}`, RED); }
function logWarn(msg) { log(`⚠ ${msg}`, YELLOW); }

// ── Env check ──────────────────────────────────────────────
const hasToken = typeof NOTION_TOKEN === 'string' && NOTION_TOKEN.length > 0 && NOTION_TOKEN !== '***' && NOTION_TOKEN !== 'invalid';
const hasDbId = typeof NOTION_DATABASE_ID === 'string' && NOTION_DATABASE_ID.length > 0 && NOTION_DATABASE_ID !== '***' && NOTION_DATABASE_ID !== 'invalid';

const isEnvOnly = process.argv.includes('--env');

log('\n=== Notion Environment Check ===');
log(`NOTION_TOKEN: ${hasToken ? GREEN + 'set' : RED + 'missing/invalid'}`);
log(`NOTION_DATABASE_ID: ${hasDbId ? GREEN + 'set' : RED + 'missing/invalid'}${RESET}\n`);

if (isEnvOnly) {
  if (!hasToken || !hasDbId) {
    logError('Environment check failed. Set NOTION_TOKEN and NOTION_DATABASE_ID.');
    process.exit(1);
  }
  logSuccess('Environment check passed.');
  process.exit(0);
}

// ── Full Notion API validation ──────────────────────────────
if (!hasToken || !hasDbId) {
  logError('Missing Notion credentials. Cannot run API validation.');
  logWarn('Set NOTION_TOKEN and NOTION_DATABASE_ID to run production validation.');
  process.exit(1);
}

log('\n=== Notion API Validation ===');
log(`Token: ${NOTION_TOKEN.slice(0, 8)}...`);
log(`Database ID: ${NOTION_DATABASE_ID}\n`);

try {
  const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}`, {
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
    },
  });

  if (response.ok) {
    const data = await response.json();
    logSuccess(`Connected to Notion database: "${data.title?.[0]?.plain_text || NOTION_DATABASE_ID}"`);
    logSuccess('Notion API validation passed.');
    process.exit(0);
  } else if (response.status === 401) {
    logError(`401 Unauthorized: NOTION_TOKEN is invalid.`);
    process.exit(1);
  } else if (response.status === 404) {
    logError(`404 Not Found: NOTION_DATABASE_ID "${NOTION_DATABASE_ID}" not found.`);
    process.exit(1);
  } else {
    logError(`Notion API error: ${response.status} ${response.statusText}`);
    process.exit(1);
  }
} catch (err) {
  logError(`Network error: ${err.message}`);
  logWarn('Ensure you have internet access and NOTION_TOKEN is valid.');
  process.exit(1);
}
