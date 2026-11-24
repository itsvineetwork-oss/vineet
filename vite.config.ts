import { defineConfig } from "vite";
import { execSync } from "node:child_process";

const sh = (cmd: string, fallback: string) => { try { return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim() || fallback; } catch { return fallback; } };
const commits = sh("git rev-list --count HEAD", "0");
const short = sh("git rev-parse --short HEAD", "local");

export default defineConfig({
  base: process.env.BASE_PATH || "/",
  define: {
    __REVISION__: JSON.stringify(`r${commits}-${short}`),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  build: { target: "es2022", sourcemap: false },
});
