import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";

const DEFAULT_BASE_URL = "http://localhost:3000";

async function getBaseUrl() {
  const stored = await browser.storage.local.get("mytoolkitBaseUrl");
  return String(stored.mytoolkitBaseUrl || DEFAULT_BASE_URL).replace(/\/$/, "");
}

async function openCapture(url?: string, title?: string) {
  if (!url) return;
  const baseUrl = await getBaseUrl();
  const target = new URL("/capture/new", baseUrl);
  target.searchParams.set("url", url);
  if (title) target.searchParams.set("title", title);
  await browser.tabs.create({ url: target.toString() });
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: "save-page",
      title: "Save page to MyToolkit",
      contexts: ["page"],
    });
    browser.contextMenus.create({
      id: "save-link",
      title: "Save link to MyToolkit",
      contexts: ["link"],
    });
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    const url = info.linkUrl || info.pageUrl || tab?.url;
    const title = info.linkText || tab?.title;
    void openCapture(url, title);
  });
});
