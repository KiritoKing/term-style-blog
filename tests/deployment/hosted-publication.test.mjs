import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  HostedPublicationError,
  REVISION_ATTRIBUTE,
  stampPublication,
  verifyHostedPublication,
} from "../../scripts/verify-hosted-publication.mjs";

const SOURCE_ENV = Object.freeze({
  PUBLICATION_FRAMEWORK_SHA: "1".repeat(40),
  PUBLICATION_CONTENT_SHA: "2".repeat(40),
  PUBLICATION_MANIFEST_SHA256: "3".repeat(64),
  CLOUDFLARE_PAGES_PROJECT: "term-style-blog",
});

const PREVIEW_ORIGIN = "https://abc123def456.term-style-blog.pages.dev";

function html(mode, title, body = "<main>Real blog article</main>") {
  const robots = mode === "preview" ? "noindex, nofollow" : "index, follow";
  return `<!doctype html><html lang="zh-CN"><head><meta name="robots" content="${robots}"><title>${title}</title></head><body>${body}</body></html>`;
}

function robots(mode) {
  return mode === "preview"
    ? "User-agent: *\nDisallow: /\n"
    : "User-agent: *\nAllow: /\nSitemap: https://chlorinec.top/sitemap-index.xml\n";
}

async function makeDist(mode = "preview") {
  const root = await mkdtemp(path.join(os.tmpdir(), "hosted-publication-test-"));
  await mkdir(path.join(root, "articles", "one"), { recursive: true });
  await mkdir(path.join(root, "legacy"), { recursive: true });
  await writeFile(path.join(root, "index.html"), html(mode, "Home - ChlorineC"));
  await writeFile(
    path.join(root, "articles", "one", "index.html"),
    html(mode, "One article - ChlorineC"),
  );
  await writeFile(path.join(root, "404.html"), html(mode, "Not found - ChlorineC"));
  await writeFile(
    path.join(root, "legacy", "index.html"),
    '<!doctype html><meta http-equiv="refresh" content="0;url=/articles/one/"><body>Redirecting to <code>/articles/one/</code></body>',
  );
  await writeFile(path.join(root, "robots.txt"), robots(mode));
  return root;
}

function environment(mode = "preview", overrides = {}) {
  return { ...SOURCE_ENV, PUBLICATION_MODE: mode, ...overrides };
}

function pathForUrl(distDir, url) {
  const pathname = new URL(url).pathname;
  if (pathname === "/") return path.join(distDir, "index.html");
  if (pathname.endsWith("/")) {
    return path.join(distDir, decodeURIComponent(pathname.slice(1)), "index.html");
  }
  return path.join(distDir, decodeURIComponent(pathname.slice(1)));
}

function fixtureFetch(distDir, mutate, calls = []) {
  return async (input, init = {}) => {
    const url = String(input);
    const request = { url, init, path: new URL(url).pathname };
    calls.push(request);
    const file = pathForUrl(distDir, url);
    let body;
    try {
      body = await readFile(file, "utf8");
    } catch {
      return new Response("missing", { status: 404 });
    }
    const changed = mutate ? await mutate({ ...request, body }) : undefined;
    if (changed instanceof Response) return changed;
    body = changed ?? body;
    const contentType = request.path.endsWith(".json")
      ? "application/json"
      : request.path.endsWith(".txt")
      ? "text/plain"
      : "text/html";
    return new Response(body, { status: 200, headers: { "content-type": contentType } });
  };
}

async function withDist(mode, callback) {
  const distDir = await makeDist(mode);
  try {
    await callback(distDir);
  } finally {
    await rm(distDir, { recursive: true, force: true });
  }
}

function fastOptions(distDir, mode = "preview", overrides = {}) {
  return {
    distDir,
    url: mode === "production" ? "https://chlorinec.top" : PREVIEW_ORIGIN,
    environment: environment(mode),
    retries: 0,
    retryDelayMs: 0,
    propagationTimeoutMs: 0,
    sleep: async () => {},
    ...overrides,
  };
}

test("stamps every HTML file while excluding 404 from sorted 200-route inventory", async () => {
  await withDist("preview", async (distDir) => {
    const publication = await stampPublication({
      distDir,
      environment: environment("preview"),
    });

    assert.deepEqual(
      publication.routes.map((route) => route.path),
      ["/", "/articles/one/"],
    );
    assert.equal(publication.mode, "preview");
    assert.match(publication.build_revision, /^[a-f0-9]{64}$/);

    const notFound = await readFile(path.join(distDir, "404.html"), "utf8");
    const redirect = await readFile(path.join(distDir, "legacy", "index.html"), "utf8");
    assert.match(
      notFound,
      new RegExp(`${REVISION_ATTRIBUTE}="${publication.build_revision}"`),
    );
    assert.match(
      redirect,
      new RegExp(`<html ${REVISION_ATTRIBUTE}="${publication.build_revision}">`),
    );

    const saved = JSON.parse(await readFile(path.join(distDir, "publication.json"), "utf8"));
    assert.deepEqual(saved, publication);
  });
});

test("verifies a complete protected preview and scopes Access headers to its exact origin", async () => {
  await withDist("preview", async (distDir) => {
    await stampPublication({ distDir, environment: environment("preview") });
    const calls = [];
    const secretEnv = environment("preview", {
      CF_ACCESS_CLIENT_ID: "fixture-client-id",
      CF_ACCESS_CLIENT_SECRET: "fixture-client-secret",
    });

    const result = await verifyHostedPublication(fastOptions(distDir, "preview", {
      environment: secretEnv,
      fetchImpl: fixtureFetch(distDir, undefined, calls),
    }));

    assert.equal(result.route_count, 2);
    assert.ok(calls.length >= 4);
    for (const call of calls) {
      assert.equal(new URL(call.url).origin, PREVIEW_ORIGIN);
      assert.equal(call.init.redirect, "manual");
      const headers = new Headers(call.init.headers);
      assert.equal(headers.get("CF-Access-Client-Id"), "fixture-client-id");
      assert.equal(headers.get("CF-Access-Client-Secret"), "fixture-client-secret");
    }
  });
});

test("rejects stale or wrong hosted revision markers", async () => {
  await withDist("preview", async (distDir) => {
    await stampPublication({ distDir, environment: environment("preview") });
    const fetchImpl = fixtureFetch(distDir, ({ path: requestPath, body }) =>
      requestPath === "/articles/one/"
        ? body.replace(/data-publication-revision="[a-f0-9]+"/, `data-publication-revision="${"0".repeat(64)}"`)
        : body);

    await assert.rejects(
      verifyHostedPublication(fastOptions(distDir, "preview", { fetchImpl })),
      (error) => error instanceof HostedPublicationError && error.code === "ROUTE_REVISION_MISMATCH",
    );
  });
});

test("rejects a 200 Cloudflare Access login page as blog HTML", async () => {
  await withDist("preview", async (distDir) => {
    await stampPublication({ distDir, environment: environment("preview") });
    const fetchImpl = fixtureFetch(distDir, ({ path: requestPath }) =>
      requestPath === "/"
        ? '<!doctype html><html><head><title>Cloudflare Access</title></head><body><form action="/cdn-cgi/access/login">Sign in</form></body></html>'
        : undefined);

    await assert.rejects(
      verifyHostedPublication(fastOptions(distDir, "preview", { fetchImpl })),
      (error) => error instanceof HostedPublicationError && error.code === "AUTH_LOGIN_RESPONSE",
    );
  });
});

test("accepts a stamped technical article about Cloudflare Access login forms", async () => {
  await withDist("preview", async (distDir) => {
    await writeFile(
      path.join(distDir, "index.html"),
      html(
        "preview",
        "Cloudflare Access login integration - ChlorineC",
        '<main>Example:</main><form action="/cdn-cgi/access/login">Demo form</form>',
      ),
    );
    await stampPublication({ distDir, environment: environment("preview") });

    const result = await verifyHostedPublication(fastOptions(distDir, "preview", {
      fetchImpl: fixtureFetch(distDir),
    }));
    assert.equal(result.verified, true);
  });
});

test("fails closed on redirects and never forwards Access credentials cross-origin", async () => {
  await withDist("preview", async (distDir) => {
    await stampPublication({ distDir, environment: environment("preview") });
    const calls = [];
    const fetchImpl = fixtureFetch(distDir, ({ path: requestPath }) => {
      if (requestPath === "/publication.json") {
        return new Response(null, {
          status: 302,
          headers: { location: "https://attacker.example/login" },
        });
      }
      return undefined;
    }, calls);

    await assert.rejects(
      verifyHostedPublication(fastOptions(distDir, "preview", {
        environment: environment("preview", {
          CF_ACCESS_CLIENT_ID: "fixture-client-id",
          CF_ACCESS_CLIENT_SECRET: "fixture-client-secret",
        }),
        fetchImpl,
      })),
      (error) => error instanceof HostedPublicationError && error.code === "REDIRECT_REJECTED",
    );
    assert.equal(calls.length, 1);
    assert.equal(calls[0].init.redirect, "manual");
    assert.equal(new URL(calls[0].url).origin, PREVIEW_ORIGIN);
  });
});

test("rejects incomplete Access auth without fetching or exposing the configured value", async () => {
  await withDist("preview", async (distDir) => {
    await stampPublication({ distDir, environment: environment("preview") });
    let fetched = false;
    const configuredValue = "must-not-appear-in-errors";

    await assert.rejects(
      verifyHostedPublication(fastOptions(distDir, "preview", {
        environment: environment("preview", { CF_ACCESS_CLIENT_ID: configuredValue }),
        fetchImpl: async () => {
          fetched = true;
          throw new Error("unexpected fetch");
        },
      })),
      (error) => {
        assert.equal(fetched, false);
        assert.ok(error instanceof HostedPublicationError);
        assert.equal(error.code, "INCOMPLETE_ACCESS_AUTH");
        assert.doesNotMatch(error.message, new RegExp(configuredValue));
        return true;
      },
    );
  });
});

test("rejects publication mode and indexing policy mismatches", async () => {
  await withDist("production", async (distDir) => {
    await stampPublication({ distDir, environment: environment("production") });
    const fetchImpl = fixtureFetch(distDir, ({ path: requestPath, body }) => {
      if (requestPath === "/publication.json") {
        const publication = JSON.parse(body);
        publication.mode = "preview";
        return `${JSON.stringify(publication)}\n`;
      }
      return undefined;
    });

    await assert.rejects(
      verifyHostedPublication(fastOptions(distDir, "production", { fetchImpl })),
      (error) => error instanceof HostedPublicationError && error.code === "REMOTE_PUBLICATION_MISMATCH",
    );
  });

  await withDist("production", async (distDir) => {
    await stampPublication({ distDir, environment: environment("production") });
    const fetchImpl = fixtureFetch(distDir, ({ path: requestPath, body }) =>
      requestPath === "/" ? body.replace("index, follow", "noindex, nofollow") : undefined);
    await assert.rejects(
      verifyHostedPublication(fastOptions(distDir, "production", { fetchImpl })),
      (error) => error instanceof HostedPublicationError && error.code === "HTML_INDEX_POLICY",
    );
  });
});

test("rejects failed routes and local HTML missing its immutable revision", async () => {
  await withDist("preview", async (distDir) => {
    await stampPublication({ distDir, environment: environment("preview") });
    const fetchImpl = fixtureFetch(distDir, ({ path: requestPath }) =>
      requestPath === "/articles/one/" ? new Response("unavailable", { status: 503 }) : undefined);

    await assert.rejects(
      verifyHostedPublication(fastOptions(distDir, "preview", { fetchImpl })),
      (error) => error instanceof HostedPublicationError && error.code === "HTTP_STATUS",
    );
  });

  await withDist("preview", async (distDir) => {
    await stampPublication({ distDir, environment: environment("preview") });
    const indexPath = path.join(distDir, "index.html");
    const index = await readFile(indexPath, "utf8");
    await writeFile(indexPath, index.replace(/ data-publication-revision="[a-f0-9]+"/, ""));
    let fetched = false;

    await assert.rejects(
      verifyHostedPublication(fastOptions(distDir, "preview", {
        fetchImpl: async () => {
          fetched = true;
          throw new Error("unexpected fetch");
        },
      })),
      (error) => error instanceof HostedPublicationError && error.code === "LOCAL_REVISION_MISSING",
    );
    assert.equal(fetched, false);
  });
});

test("retries hosted 404 only during bounded production propagation", async () => {
  await withDist("production", async (distDir) => {
    await stampPublication({ distDir, environment: environment("production") });
    let publicationCalls = 0;
    let clock = 0;
    const fetchImpl = fixtureFetch(distDir, ({ path: requestPath }) => {
      if (requestPath === "/publication.json" && publicationCalls++ === 0) {
        return new Response("not propagated", { status: 404 });
      }
      return undefined;
    });

    const result = await verifyHostedPublication(fastOptions(distDir, "production", {
      fetchImpl,
      propagationTimeoutMs: 1_000,
      retryDelayMs: 100,
      now: () => clock,
      sleep: async (milliseconds) => {
        clock += milliseconds;
      },
    }));
    assert.equal(result.verified, true);
    assert.equal(publicationCalls, 2);
  });

  await withDist("preview", async (distDir) => {
    await stampPublication({ distDir, environment: environment("preview") });
    let publicationCalls = 0;
    const fetchImpl = fixtureFetch(distDir, ({ path: requestPath }) => {
      if (requestPath === "/publication.json") publicationCalls += 1;
      return requestPath === "/publication.json"
        ? new Response("missing", { status: 404 })
        : undefined;
    });

    await assert.rejects(
      verifyHostedPublication(fastOptions(distDir, "preview", { fetchImpl })),
      (error) => error instanceof HostedPublicationError && error.code === "HTTP_STATUS",
    );
    assert.equal(publicationCalls, 1);
  });
});

test("keeps route concurrency bounded and drains started workers before rejection", async () => {
  await withDist("preview", async (distDir) => {
    for (const slug of ["two", "three"]) {
      const directory = path.join(distDir, "articles", slug);
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, "index.html"), html("preview", `${slug} - ChlorineC`));
    }
    const publication = await stampPublication({ distDir, environment: environment("preview") });
    let inFlight = 0;
    let maximumInFlight = 0;
    const completed = [];
    const fetchImpl = fixtureFetch(distDir, async ({ path: requestPath, body }) => {
      if (!publication.routes.some((route) => route.path === requestPath)) return undefined;
      inFlight += 1;
      maximumInFlight = Math.max(maximumInFlight, inFlight);
      try {
        await new Promise((resolve) => setTimeout(resolve, requestPath === "/" ? 1 : 8));
        if (requestPath === "/") {
          return body.replace(
            /data-publication-revision="[a-f0-9]+"/,
            `data-publication-revision="${"0".repeat(64)}"`,
          );
        }
        completed.push(requestPath);
        return body;
      } finally {
        inFlight -= 1;
      }
    });

    await assert.rejects(
      verifyHostedPublication(fastOptions(distDir, "preview", {
        concurrency: 2,
        fetchImpl,
      })),
      (error) => error instanceof HostedPublicationError && error.code === "ROUTE_REVISION_MISMATCH",
    );
    assert.equal(maximumInFlight, 2);
    assert.equal(inFlight, 0);
    assert.equal(completed.length, publication.routes.length - 1);
  });
});

test("prioritizes a terminal login failure over a concurrent retryable stale route", async () => {
  await withDist("production", async (distDir) => {
    await stampPublication({ distDir, environment: environment("production") });
    let publicationCalls = 0;
    let sleepCalls = 0;
    let clock = 0;
    const fetchImpl = fixtureFetch(distDir, async ({ path: requestPath, body }) => {
      if (requestPath === "/publication.json") {
        publicationCalls += 1;
        return undefined;
      }
      if (requestPath === "/") {
        await new Promise((resolve) => setTimeout(resolve, 1));
        return body.replace(
          /data-publication-revision="[a-f0-9]+"/,
          `data-publication-revision="${"0".repeat(64)}"`,
        );
      }
      if (requestPath === "/articles/one/") {
        await new Promise((resolve) => setTimeout(resolve, 2));
        return '<!doctype html><html><head><title>Cloudflare Access</title></head><body><form action="/cdn-cgi/access/login">Sign in</form></body></html>';
      }
      return undefined;
    });

    await assert.rejects(
      verifyHostedPublication(fastOptions(distDir, "production", {
        concurrency: 2,
        fetchImpl,
        propagationTimeoutMs: 1_000,
        retryDelayMs: 100,
        now: () => clock,
        sleep: async (milliseconds) => {
          sleepCalls += 1;
          clock += milliseconds;
        },
      })),
      (error) => error instanceof HostedPublicationError && error.code === "AUTH_LOGIN_RESPONSE",
    );
    assert.equal(publicationCalls, 1);
    assert.equal(sleepCalls, 0);
  });
});

test("production checks the canonical host without sending Access credentials", async () => {
  await withDist("production", async (distDir) => {
    await stampPublication({ distDir, environment: environment("production") });
    const calls = [];
    await verifyHostedPublication(fastOptions(distDir, "production", {
      environment: environment("production", {
        CF_ACCESS_CLIENT_ID: "fixture-client-id",
        CF_ACCESS_CLIENT_SECRET: "fixture-client-secret",
      }),
      fetchImpl: fixtureFetch(distDir, undefined, calls),
    }));

    for (const call of calls) {
      const headers = new Headers(call.init.headers);
      assert.equal(headers.has("CF-Access-Client-Id"), false);
      assert.equal(headers.has("CF-Access-Client-Secret"), false);
    }
  });
});
