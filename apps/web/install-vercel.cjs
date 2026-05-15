#!/usr/bin/env node
"use strict";

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const appDir = __dirname;
const monorepoCandidates = [path.resolve(appDir, "../.."), path.resolve(appDir, "..")];

function findMonorepoRoot() {
  for (const root of monorepoCandidates) {
    if (
      fs.existsSync(path.join(root, "pnpm-lock.yaml")) &&
      fs.existsSync(path.join(root, "pnpm-workspace.yaml"))
    ) {
      return root;
    }
  }
  return null;
}

const root = findMonorepoRoot();
if (!root) {
  console.error(`
Auryn Vercel install failed: pnpm-lock.yaml is not available.

Your deployment only uploaded the apps/web folder (~197 files). The monorepo
lockfile lives at the repository root, so "pnpm install --frozen-lockfile" in
apps/web cannot work.

Fix in vercel.com → your project → Settings → General → Build & Development:

  RECOMMENDED
    Root Directory: (empty — delete "apps/web")
    Output Directory: apps/web/.next
    Install Command: (turn OFF override, leave empty)
    Build Command: (turn OFF override, leave empty)

  OR keep Root Directory = apps/web AND:
    Enable "Include source files outside of the Root Directory in the Build Step"
    Install Command: node install-vercel.cjs
    Build Command: bash scripts/vercel-build.sh

Also check Settings → Git → Production Branch matches the branch you push
(e.g. Gurjeet/base-setup). "main" may not include vercel.json yet.

Then redeploy (Deployments → … → Redeploy).
`);
  process.exit(1);
}

console.log(`[auryn] pnpm install from monorepo root: ${root}`);
execSync("pnpm install --frozen-lockfile", {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, HUSKY: "0" },
});
