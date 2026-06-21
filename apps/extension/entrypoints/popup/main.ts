const DEFAULT_BASE_URL = "https://web-sigma-eight-44.vercel.app";

const baseUrlInput = document.querySelector<HTMLInputElement>("#baseUrl")!;
const saveSettingsButton = document.querySelector<HTMLButtonElement>("#saveSettings")!;
const captureButton = document.querySelector<HTMLButtonElement>("#capture")!;
const statusEl = document.querySelector<HTMLDivElement>("#status")!;

async function loadSettings() {
  const stored = await chrome.storage.local.get("mytoolkitBaseUrl");
  baseUrlInput.value = String(stored.mytoolkitBaseUrl || DEFAULT_BASE_URL);
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function captureUrl(baseUrl: string, tabUrl: string, title?: string) {
  const target = new URL("/capture/new", baseUrl.replace(/\/$/, ""));
  target.searchParams.set("url", tabUrl);
  if (title) target.searchParams.set("title", title);
  return target.toString();
}

saveSettingsButton.addEventListener("click", async () => {
  await chrome.storage.local.set({ mytoolkitBaseUrl: baseUrlInput.value || DEFAULT_BASE_URL });
  statusEl.textContent = "تم حفظ رابط الموقع.";
});

captureButton.addEventListener("click", async () => {
  const tab = await getActiveTab();
  if (!tab.url) {
    statusEl.textContent = "لا يمكن قراءة رابط التبويب الحالي.";
    return;
  }
  const baseUrl = baseUrlInput.value || DEFAULT_BASE_URL;
  await chrome.tabs.create({ url: captureUrl(baseUrl, tab.url, tab.title) });
});

void loadSettings();
