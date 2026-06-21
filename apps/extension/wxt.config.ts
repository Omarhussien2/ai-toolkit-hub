import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "MyToolkit Capture",
    description: "Save AI and tech links to MyToolkit with editable metadata review.",
    version: "0.1.0",
    permissions: ["activeTab", "contextMenus", "storage"],
    host_permissions: ["http://*/*", "https://*/*"],
    action: {
      default_title: "Save to MyToolkit",
      default_popup: "popup.html"
    }
  }
});
