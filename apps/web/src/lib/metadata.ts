import dns from "node:dns/promises";
import net from "node:net";
import * as cheerio from "cheerio";
import type { MetadataResult } from "@/lib/types";
import { getDomain, normalizeUrl, parseGitHubRepoUrl } from "@/lib/utils";

const MAX_BYTES = 500_000;
const MAX_REDIRECTS = 3;

function isPrivateIp(address: string) {
  if (net.isIPv4(address)) {
    const parts = address.split(".").map(Number);
    const [a, b] = parts;
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    );
  }

  if (net.isIPv6(address)) {
    const lowered = address.toLowerCase();
    return (
      lowered === "::1" ||
      lowered.startsWith("fc") ||
      lowered.startsWith("fd") ||
      lowered.startsWith("fe80")
    );
  }

  return true;
}

async function assertPublicHttpUrl(value: string) {
  const parsed = new URL(value);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }
  const records = await dns.lookup(parsed.hostname, { all: true, verbatim: false });
  if (records.some((record) => isPrivateIp(record.address))) {
    throw new Error("Private network URLs are not allowed.");
  }
  return parsed;
}

async function fetchHtml(url: string, redirects = 0): Promise<{ html: string; finalUrl: string }> {
  await assertPublicHttpUrl(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "user-agent": "MyToolkitMetadataBot/1.0",
        accept: "text/html,application/xhtml+xml",
      },
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (redirects >= MAX_REDIRECTS) throw new Error("Too many redirects.");
      const location = response.headers.get("location");
      if (!location) throw new Error("Redirect without location.");
      return fetchHtml(new URL(location, url).toString(), redirects + 1);
    }

    if (!response.ok) throw new Error(`Failed to fetch URL (${response.status}).`);
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType && !contentType.includes("text/html")) {
      throw new Error("URL does not look like an HTML page.");
    }

    const reader = response.body?.getReader();
    if (!reader) return { html: await response.text(), finalUrl: url };

    const chunks: Uint8Array[] = [];
    let received = 0;
    while (received < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      received += value.length;
    }

    const html = Buffer.concat(chunks, Math.min(received, MAX_BYTES)).toString("utf8");
    return { html, finalUrl: url };
  } finally {
    clearTimeout(timeout);
  }
}

function absoluteUrl(value: string | undefined, base: string) {
  if (!value) return null;
  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
}

function firstMeta($: cheerio.CheerioAPI, selectors: string[]) {
  for (const selector of selectors) {
    const content = $(selector).attr("content") || $(selector).attr("href");
    if (content?.trim()) return content.trim();
  }
  return "";
}

function suggest(url: string, title: string, description: string) {
  const text = `${url} ${title} ${description}`.toLowerCase();
  const rules = [
    { category: "برمجة", tags: ["code", "dev"], words: ["github", "code", "api", "developer", "programming"] },
    { category: "تصميم", tags: ["design"], words: ["design", "figma", "image", "logo", "ui"] },
    { category: "ميديا", tags: ["media"], words: ["video", "image", "photo", "media", "runway", "midjourney"] },
    { category: "صوت", tags: ["audio"], words: ["audio", "voice", "speech", "music"] },
    { category: "كتابة", tags: ["writing"], words: ["write", "copy", "blog", "content"] },
    { category: "بحث", tags: ["research"], words: ["search", "research", "paper", "browser"] },
    { category: "إنتاجية", tags: ["productivity"], words: ["productivity", "notes", "calendar", "task"] },
  ];

  const matched = rules.find((rule) => rule.words.some((word) => text.includes(word)));
  const domain = getDomain(url).split(".")[0];
  return {
    category: matched?.category ?? "أخرى",
    tags: Array.from(new Set([domain, ...(matched?.tags ?? [])].filter(Boolean))).slice(0, 6),
  };
}

type GitHubRepoApi = {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  pushed_at: string | null;
  license: { spdx_id?: string | null; name?: string | null } | null;
  owner: { avatar_url?: string | null };
};

async function extractGitHubMetadata(inputUrl: string): Promise<MetadataResult | null> {
  const repo = parseGitHubRepoUrl(inputUrl);
  if (!repo) return null;

  const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}`, {
    headers: {
      "user-agent": "MyToolkitMetadataBot/1.0",
      accept: "application/vnd.github+json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as GitHubRepoApi;
  const topics = data.topics ?? [];
  const language = data.language ? [data.language] : [];
  const normalized = normalizeUrl(inputUrl.startsWith("http") ? inputUrl : `https://${inputUrl}`);

  return {
    url: normalized,
    canonical_url: normalized,
    title: data.full_name,
    description: data.description || "GitHub repository.",
    site_name: "GitHub",
    domain: "github.com",
    language: null,
    image_url: data.owner.avatar_url ?? null,
    favicon_url: "https://github.githubassets.com/favicons/favicon.svg",
    suggested_category: "GitHub",
    suggested_tags: Array.from(new Set(["github", ...language, ...topics])).slice(0, 10),
    detected_type: "github",
    use_cases: topics.slice(0, 6),
    libraries: Array.from(new Set([...language, ...topics])).slice(0, 8),
    github_owner: repo.owner,
    github_repo: repo.repo,
    github_full_name: data.full_name,
    github_stars: data.stargazers_count,
    github_forks: data.forks_count,
    github_language: data.language,
    github_license: data.license?.spdx_id || data.license?.name || null,
    github_topics: topics,
    github_pushed_at: data.pushed_at,
  };
}

export async function extractMetadata(inputUrl: string): Promise<MetadataResult> {
  const initial = normalizeUrl(inputUrl.startsWith("http") ? inputUrl : `https://${inputUrl}`);
  const githubMetadata = await extractGitHubMetadata(initial);
  if (githubMetadata) return githubMetadata;

  const { html, finalUrl } = await fetchHtml(initial);
  const $ = cheerio.load(html);
  const canonical = absoluteUrl(
    $('link[rel="canonical"]').attr("href") || firstMeta($, ['meta[property="og:url"]']),
    finalUrl,
  );
  const title =
    firstMeta($, ['meta[property="og:title"]', 'meta[name="twitter:title"]']) ||
    $("title").first().text().trim() ||
    getDomain(finalUrl);
  const description =
    firstMeta($, [
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    ]) || "لا يوجد وصف متاح لهذا الرابط بعد.";
  const image = absoluteUrl(
    firstMeta($, ['meta[property="og:image"]', 'meta[name="twitter:image"]']),
    finalUrl,
  );
  const favicon = absoluteUrl(
    $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      "/favicon.ico",
    finalUrl,
  );
  const language = $("html").attr("lang") || null;
  const domain = getDomain(finalUrl);
  const suggestion = suggest(finalUrl, title, description);

  return {
    url: initial,
    canonical_url: canonical ?? finalUrl,
    title: title.slice(0, 180),
    description: description.slice(0, 500),
    site_name: firstMeta($, ['meta[property="og:site_name"]']) || null,
    domain,
    language,
    image_url: image,
    favicon_url: favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    suggested_category: suggestion.category,
    suggested_tags: suggestion.tags,
  };
}
