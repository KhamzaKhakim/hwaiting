import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  icons: {
    16: "logo-16.png",
    32: "logo-32.png",
    192: "logo-192.png",
  },
  action: {
    default_icon: {
      32: "logo-32.png",
    },
    default_popup: "src/popup/index.html",
  },
  content_scripts: [
    {
      js: ["src/content/main.ts"],
      matches: ["https://*/*"],
    },
  ],
  permissions: ["contentSettings", "storage", "identity"],
  side_panel: {
    default_path: "src/sidepanel/index.html",
  },
  oauth2: {
    client_id:
      "412890413255-ehihhajtd53vla212c10af218nftka8i.apps.googleusercontent.com",
    scopes: [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  },
  key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAj0p5Cz+JhYk/WoF9XSP7gtpXoKKFiDKc05th2UWSSZN9CM3ug/fu39Wc0NMKUFe7pxzQAW3CFg08zXoWSuWWkiLeqmffZfliSGILwlfqedL7F8JZQ+G5N+r9OWiqxaddyW7yloETH8ct2l7zX7MIwj610cu0bwEOjmkODx5Qb7kvwrHCToS8zgMF1sG9qgy5Xj80c+Lbwtb7cKKztUK1EeH9BtCSLl0PiuRz7TohS6XnKOyGi+YKzLI0umEpKSxq6tjDQ7tO9DO//ipPflbnQVYAgKgfn91Cg9uKY4TnLdVnSttHsR77fc8Z1PHLWPKZX8MtLPWwB1ClPpsoBL2SjwIDAQAB",
});
