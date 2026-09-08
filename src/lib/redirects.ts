export type HistoricalUrlMap = Record<string, string[]>;

export type RedirectRule = {
  from: string;
  to: string;
  status: 301;
};

const normalizeAlias = (alias: string): string =>
  alias.startsWith('/') ? alias : `/${alias}`;

export const compileRedirectRules = (map: HistoricalUrlMap): RedirectRule[] =>
  Object.entries(map).flatMap(([slug, aliases]) =>
    aliases.map((alias) => ({
      from: normalizeAlias(alias),
      to: `/posts/${slug}`,
      status: 301 as const,
    })),
  );

