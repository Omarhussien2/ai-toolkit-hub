import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "MyToolkit Capture",
    description: "Save AI and tech links to MyToolkit with editable metadata review.",
    version: "0.1.0",
    permissions: ["activeTab", "contextMenus", "storage"],
    host_permissions: ["http://*/*", "https://*/*"],
    icons: {
      "16": "icon-16.png",
      "32": "icon-32.png",
      "48": "icon-48.png",
      "128": "icon-128.png"
    },
    action: {
      default_title: "Save to MyToolkit",
      default_popup: "popup.html",
      default_icon: {
        "16": "icon-16.png",
        "32": "icon-32.png",
        "48": "icon-48.png",
        "128": "icon-128.png"
      }
    }
  }
});
