#!/usr/bin/env zx

import fs from "node:fs/promises";
import { watch } from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

// Ensure paths resolve relative to the repo root regardless of caller's cwd
cd(import.meta.dirname);

// ── Data Declarations ──────────────────────────────────────────────────────

const packages = [
  "cowsay", "coreutils", "curl", "findutils", "fish", "fortune", "gh", "git",
  "htop", "jq", "krew", "kubectl", "kubectx", "lolcat", "mise", "moreutils",
  "sqlite", "telnet", "terminal-notifier", "terraform", "tmux", "tree", "uv",
  "awscli", "vim", "wget", "claude-code",
];

const casks = [
  "alt-tab", "audacity", "battle-net", "claude", "copilot", "discord",
  "font-monaspace", "ghostty", "hammerspoon", "jetbrains-toolbox", "keybase",
  "kiro", "linear-linear", "logitech-g-hub", "minecraft", "obs", "obsidian",
  "ollama", "orbstack", "scroll-reverser", "slack", "sonos", "spotify",
  "steam", "visual-studio-code", "vlc", "zen", "zoom",
];

const directories = (params) => [
  "~/tmp", "~/source",
  ...(params.isTaxbitLaptop ? ["~/source/taxbit"] : []),
];

const gitRepos = [
  { repo: "eabrouwer3/advent-of-code", dest: "~/source/advent-of-code" },
  { repo: "eabrouwer3/ebrouwer.dev", dest: "~/source/ebrouwer.dev" },
  { repo: "eabrouwer3/project-euler", dest: "~/source/project-euler" },
];

const files = [
  { src: "files/fish", dest: "~/.config/fish" },
  { src: "files/ghostty/config", dest: "~/.config/ghostty/config" },
  { src: "files/hammerspoon/init.lua", dest: "~/.hammerspoon/init.lua" },
  { src: "files/tmux/tmux.conf", dest: "~/.tmux.conf" },
  { src: "files/aws/config", dest: "~/.aws/config" },
  { src: "files/claude/CLAUDE.md", dest: "~/.claude/CLAUDE.md" },
  { src: "files/mise/config.toml", dest: "~/.config/mise/config.toml" },
  { src: "files/kiro/steering", dest: "~/.kiro/steering" },
  { src: "files/kiro/hooks", dest: "~/.kiro/hooks" },
  { src: "files/taxbit/tv.json", dest: "~/.taxbit/tv.json" },
  { src: "files/vim/vimrc", dest: "~/.vimrc" },
  { src: "files/npm/npmrc", dest: "~/.npmrc" },
];

const secrets = [
  { src: "secrets/node-auth-token.age", dest: "~/.config/dotfiles/secrets/node-auth-token" },
  { src: "secrets/aws-credentials.age", dest: "~/.aws/credentials" },
  { src: "secrets/kiro-mcp-json.age", dest: "~/.kiro/settings/mcp.json" },
];

const commands = [
  {
    id: "fisher-bootstrap",
    run: `fish -c '
        if not functions -q fisher
          curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source
          fisher install jorgebucaran/fisher
        end
        fisher update
        tide configure --auto --style=Rainbow --prompt_colors="True color" --show_time=No --rainbow_prompt_separators=Angled --powerline_prompt_heads=Sharp --powerline_prompt_tails=Flat --powerline_prompt_style="Two lines, character" --prompt_connection=Solid --powerline_right_prompt_frame=No --prompt_connection_andor_frame_color=Dark --prompt_spacing=Sparse --icons="Many icons" --transient=No
      '`,
    check: "fish -c 'functions -q fisher'",
  },
  {
    id: "krew-plugins",
    run: `
        export PATH="$HOME/.krew/bin:$PATH"
        for plugin in access-matrix deprecations get-all outdated tail who-can; do
          if ! kubectl-krew list 2>/dev/null | grep -q "^$plugin "; then
            kubectl-krew install "$plugin" 2>/dev/null || true
          fi
        done
      `,
    check: `kubectl-krew list 2>/dev/null | grep -q "^access-matrix "`,
  },
];

const defaults = [
  // Finder
  { domain: "com.apple.finder", key: "AppleShowAllFiles", value: true },
  { domain: "com.apple.finder", key: "FXEnableExtensionChangeWarning", value: false },
  { domain: "com.apple.finder", key: "FXPreferredViewStyle", value: "clmv" },
  { domain: "com.apple.finder", key: "ShowPathbar", value: true },
  { domain: "com.apple.finder", key: "ShowStatusBar", value: true },
  { domain: "com.apple.finder", key: "_FXShowPosixPathInTitle", value: true },
  { domain: "com.apple.finder", key: "_FXSortFoldersFirst", value: true },
  { domain: "com.apple.finder", key: "QuitMenuItem", value: true },
  { domain: "com.apple.finder", key: "NewWindowTarget", value: "PfLo" },
  { domain: "com.apple.finder", key: "DisableAllAnimations", value: true },
  // Dock
  { domain: "com.apple.dock", key: "autohide", value: false },
  { domain: "com.apple.dock", key: "orientation", value: "right" },
  { domain: "com.apple.dock", key: "tilesize", value: 47 },
  { domain: "com.apple.dock", key: "show-recents", value: false },
  { domain: "com.apple.dock", key: "minimize-to-application", value: true },
  { domain: "com.apple.dock", key: "launchanim", value: false },
  { domain: "com.apple.dock", key: "expose-group-by-app", value: false },
  { domain: "com.apple.dock", key: "mru-spaces", value: false },
  { domain: "com.apple.dock", key: "showhidden", value: true },
  { domain: "com.apple.dock", key: "mineffect", value: "scale" },
  // NSGlobalDomain
  { domain: "NSGlobalDomain", key: "KeyRepeat", value: 2 },
  { domain: "NSGlobalDomain", key: "InitialKeyRepeat", value: 35 },
  { domain: "NSGlobalDomain", key: "AppleShowScrollBars", value: "Always" },
  { domain: "NSGlobalDomain", key: "NSAutomaticCapitalizationEnabled", value: false },
  { domain: "NSGlobalDomain", key: "NSAutomaticDashSubstitutionEnabled", value: false },
  { domain: "NSGlobalDomain", key: "NSAutomaticPeriodSubstitutionEnabled", value: false },
  { domain: "NSGlobalDomain", key: "NSAutomaticQuoteSubstitutionEnabled", value: false },
  { domain: "NSGlobalDomain", key: "NSAutomaticSpellingCorrectionEnabled", value: false },
  { domain: "NSGlobalDomain", key: "NSDisableAutomaticTermination", value: true },
  { domain: "NSGlobalDomain", key: "NSDocumentSaveNewDocumentsToCloud", value: false },
  { domain: "NSGlobalDomain", key: "NSNavPanelExpandedStateForSaveMode", value: true },
  { domain: "NSGlobalDomain", key: "NSNavPanelExpandedStateForSaveMode2", value: true },
  { domain: "NSGlobalDomain", key: "PMPrintingExpandedStateForPrint", value: true },
  { domain: "NSGlobalDomain", key: "PMPrintingExpandedStateForPrint2", value: true },
  { domain: "NSGlobalDomain", key: "com.apple.mouse.tapBehavior", value: 1 },
  { domain: "NSGlobalDomain", key: "AppleFontSmoothing", value: 1 },
  { domain: "NSGlobalDomain", key: "AppleKeyboardUIMode", value: 3 },
  { domain: "NSGlobalDomain", key: "ApplePressAndHoldEnabled", value: false },
  { domain: "NSGlobalDomain", key: "NSTableViewDefaultSizeMode", value: 2 },
  // Trackpad
  { domain: "com.apple.AppleMultitouchTrackpad", key: "Clicking", value: true },
  { domain: "com.apple.AppleMultitouchTrackpad", key: "TrackpadCornerSecondaryClick", value: 2 },
  { domain: "com.apple.AppleMultitouchTrackpad", key: "TrackpadRightClick", value: false },
  { domain: "com.apple.AppleMultitouchTrackpad", key: "TrackpadThreeFingerDrag", value: false },
  // Desktop Services
  { domain: "com.apple.desktopservices", key: "DSDontWriteNetworkStores", value: true },
  { domain: "com.apple.desktopservices", key: "DSDontWriteUSBStores", value: true },
  // Menu bar clock
  { domain: "com.apple.menuextra.clock", key: "ShowAMPM", value: true },
  { domain: "com.apple.menuextra.clock", key: "ShowDate", value: 1 },
  { domain: "com.apple.menuextra.clock", key: "ShowDayOfWeek", value: true },
  // Software Update
  { domain: "com.apple.SoftwareUpdate", key: "AutomaticallyInstallMacOSUpdates", value: true },
];

// ── Helper Functions ────────────────────────────────────────────────────────

function resolveHome(p) {
  if (p.startsWith("~/")) return path.join(os.homedir(), p.slice(2));
  return p;
}

async function fileHash(filepath) {
  try {
    const data = await fs.readFile(filepath);
    return crypto.createHash("sha256").update(data).digest("hex");
  } catch (e) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
}

async function ensureBrew() {
  const result = await $`which brew`.nothrow();
  if (result.exitCode !== 0) {
    console.log("✚ Installing Homebrew…");
    await $`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`;
  }
}

async function ensureAge() {
  const result = await $`which age`.nothrow();
  if (result.exitCode !== 0) {
    console.log("✚ Installing age…");
    await $`brew install age`;
  }
}

async function loadParams(lockfilePath) {
  const resolved = resolveHome(lockfilePath);
  try {
    const raw = await fs.readFile(resolved, "utf-8");
    const data = JSON.parse(raw);
    return data.params;
  } catch {
    // Missing or corrupted — prompt the user
    const answer = await question("Is this a Taxbit laptop? [y/N] ");
    const isTaxbitLaptop = answer.trim().toLowerCase() === "y";
    const lockfile = {
      version: 1,
      createdAt: new Date().toISOString(),
      params: { isTaxbitLaptop },
    };
    const dir = path.dirname(resolved);
    await fs.mkdir(dir, { recursive: true });
    const tmp = resolved + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(lockfile, null, 2) + "\n");
    await fs.rename(tmp, resolved);
    return lockfile.params;
  }
}

function defaultsTypeFlag(value) {
  if (typeof value === "boolean") return "-bool";
  if (typeof value === "number") return Number.isInteger(value) ? "-int" : "-float";
  return "-string";
}

function normalizeDefaultsRead(raw, desired) {
  if (typeof desired === "boolean") {
    const v = raw.trim().toLowerCase();
    return v === "1" || v === "true";
  }
  if (typeof desired === "number") return parseFloat(raw);
  return raw.trim();
}

// ── Apply Functions ──────────────────────────────────────────────────────

async function applyPackages(pkgs) {
  const applied = [], skipped = [], failed = [];
  const result = await $`brew list`.nothrow();
  const installed = new Set(result.stdout.trim().split("\n"));
  for (const pkg of pkgs) {
    try {
      if (installed.has(pkg)) {
        console.log(`  ✓ ${pkg}`);
        skipped.push(pkg);
      } else {
        await $`brew install ${pkg}`;
        console.log(`  ✚ ${pkg}`);
        applied.push(pkg);
      }
    } catch (e) {
      console.log(`  ✗ ${pkg}: ${e.message}`);
      failed.push(pkg);
    }
  }
  return { applied, skipped, failed };
}

async function applyCasks(caskList) {
  const applied = [], skipped = [], failed = [];
  const result = await $`brew list --cask`.nothrow();
  const installed = new Set(result.stdout.trim().split("\n"));
  for (const cask of caskList) {
    try {
      if (installed.has(cask)) {
        console.log(`  ✓ ${cask}`);
        skipped.push(cask);
      } else {
        await $`brew install --cask ${cask}`;
        console.log(`  ✚ ${cask}`);
        applied.push(cask);
      }
    } catch (e) {
      console.log(`  ✗ ${cask}: ${e.message}`);
      failed.push(cask);
    }
  }
  return { applied, skipped, failed };
}

async function applyDirectories(dirs) {
  const applied = [], skipped = [], failed = [];
  for (const dir of dirs) {
    const resolved = resolveHome(dir);
    try {
      await fs.stat(resolved);
      console.log(`  ✓ ${dir}`);
      skipped.push(dir);
    } catch {
      try {
        await fs.mkdir(resolved, { recursive: true });
        console.log(`  ✚ ${dir}`);
        applied.push(dir);
      } catch (e) {
        console.log(`  ✗ ${dir}: ${e.message}`);
        failed.push(dir);
      }
    }
  }
  return { applied, skipped, failed };
}

async function applyGitRepos(repos) {
  const applied = [], skipped = [], failed = [];
  for (const repo of repos) {
    const resolvedDest = resolveHome(repo.dest);
    const id = repo.repo;
    try {
      await fs.stat(path.join(resolvedDest, ".git"));
      console.log(`  ✓ ${id}`);
      skipped.push(id);
    } catch {
      try {
        await $`git clone https://github.com/${repo.repo}.git ${resolvedDest}`;
        console.log(`  ✚ ${id}`);
        applied.push(id);
      } catch (e) {
        console.log(`  ✗ ${id}: ${e.message}`);
        failed.push(id);
      }
    }
  }
  return { applied, skipped, failed };
}

async function applyFiles(fileList) {
  const applied = [], skipped = [], failed = [];
  for (const f of fileList) {
    const src = path.resolve(f.src);
    const dest = resolveHome(f.dest);
    const id = f.dest;
    try {
      const srcStat = await fs.stat(src);
      if (srcStat.isDirectory()) {
        try {
          await fs.stat(dest);
          console.log(`  ✓ ${id}`);
          skipped.push(id);
        } catch {
          await fs.cp(src, dest, { recursive: true });
          console.log(`  ✚ ${id}`);
          applied.push(id);
        }
      } else {
        const srcHash = await fileHash(src);
        const destHash = await fileHash(dest);
        if (srcHash === destHash) {
          console.log(`  ✓ ${id}`);
          skipped.push(id);
        } else {
          await fs.mkdir(path.dirname(dest), { recursive: true });
          await fs.cp(src, dest);
          console.log(`  ✚ ${id}`);
          applied.push(id);
        }
      }
    } catch (e) {
      console.log(`  ✗ ${id}: ${e.message}`);
      failed.push(id);
    }
  }
  return { applied, skipped, failed };
}

async function applySecrets(secretList) {
  const applied = [], skipped = [], failed = [];
  for (const s of secretList) {
    const dest = resolveHome(s.dest);
    const id = s.dest;
    try {
      await fs.stat(dest);
      console.log(`  ✓ ${id}`);
      skipped.push(id);
    } catch {
      try {
        await fs.mkdir(path.dirname(dest), { recursive: true });
        const result = await $`age -d -i ~/.ssh/id_rsa ${s.src}`;
        await fs.writeFile(dest, result.stdout, { mode: 0o600 });
        console.log(`  ✚ ${id}`);
        applied.push(id);
      } catch (e) {
        console.log(`  ✗ ${id}: ${e.message}`);
        failed.push(id);
      }
    }
  }
  return { applied, skipped, failed };
}

async function applyCommands(cmdList) {
  const applied = [], skipped = [], failed = [];
  for (const cmd of cmdList) {
    const id = cmd.id;
    try {
      if (cmd.check) {
        const result = await $`${["bash", "-c", cmd.check]}`.nothrow();
        if (result.exitCode === 0) {
          console.log(`  ✓ ${id}`);
          skipped.push(id);
          continue;
        }
      }
      await $`${["bash", "-c", cmd.run]}`;
      console.log(`  ✚ ${id}`);
      applied.push(id);
    } catch (e) {
      console.log(`  ✗ ${id}: ${e.message}`);
      failed.push(id);
    }
  }
  return { applied, skipped, failed };
}

async function applyDefaults(defaultsList) {
  const applied = [], skipped = [], failed = [];
  for (const d of defaultsList) {
    const id = `${d.domain}:${d.key}`;
    try {
      const result = await $`defaults read ${d.domain} ${d.key}`.nothrow();
      if (result.exitCode === 0) {
        const current = normalizeDefaultsRead(result.stdout, d.value);
        if (current === d.value) {
          console.log(`  ✓ ${id}`);
          skipped.push(id);
          continue;
        }
      }
      const flag = defaultsTypeFlag(d.value);
      await $`defaults write ${d.domain} ${d.key} ${flag} ${String(d.value)}`;
      console.log(`  ✚ ${id}`);
      applied.push(id);
    } catch (e) {
      console.log(`  ✗ ${id}: ${e.message}`);
      failed.push(id);
    }
  }
  // Caps Lock → Input Source toggle (no clean way to check, run unconditionally)
  try {
    await $`defaults write com.apple.symbolichotkeys AppleSymbolicHotKeys -dict-add 61 ${"<dict><key>enabled</key><true/><key>value</key><dict><key>parameters</key><array><integer>65535</integer><integer>57</integer><integer>8388608</integer></array><key>type</key><string>standard</string></dict></dict>"}`;
    console.log("  ✚ capslock-input-source");
    applied.push("capslock-input-source");
  } catch (e) {
    console.log(`  ✗ capslock-input-source: ${e.message}`);
    failed.push("capslock-input-source");
  }
  return { applied, skipped, failed };
}

async function applyHostname() {
  const applied = [], skipped = [], failed = [];
  const desired = "MacBook-Pro";
  try {
    const result = await $`scutil --get ComputerName`.nothrow();
    if (result.exitCode === 0 && result.stdout.trim() === desired) {
      console.log(`  ✓ hostname`);
      skipped.push("hostname");
    } else {
      await $`sudo scutil --set ComputerName ${desired}`;
      await $`sudo scutil --set HostName ${desired}`;
      await $`sudo scutil --set LocalHostName ${desired}`;
      console.log(`  ✚ hostname`);
      applied.push("hostname");
    }
  } catch (e) {
    console.log(`  ✗ hostname: ${e.message}`);
    failed.push("hostname");
  }
  return { applied, skipped, failed };
}

function printSummary(results) {
  let totalApplied = 0, totalSkipped = 0, totalFailed = 0;
  for (const r of results) {
    totalApplied += r.applied.length;
    totalSkipped += r.skipped.length;
    totalFailed += r.failed.length;
  }
  console.log(`\n${totalApplied} applied, ${totalSkipped} skipped, ${totalFailed} failed`);
}

// ── Watch / Sync Modes ───────────────────────────────────────────────────

function watchRepoToMachine(fileList) {
  const debounceTimers = new Map();

  watch("files/", { recursive: true }, (eventType, filename) => {
    if (!filename) return;

    const changed = filename;
    const mapping = fileList.find((f) => changed.startsWith(f.src.replace(/^files\//, "")));
    if (!mapping) return;

    if (debounceTimers.has(changed)) clearTimeout(debounceTimers.get(changed));

    debounceTimers.set(changed, setTimeout(async () => {
      debounceTimers.delete(changed);
      const src = path.resolve("files/", changed);
      const dest = resolveHome(mapping.dest);
      try {
        await fs.cp(src, dest, { recursive: true });
        console.log(`watch: copied ${src} → ${dest}`);
      } catch (e) {
        console.log(`watch: error copying ${src} → ${dest}: ${e.message}`);
      }
    }, 2000));
  });

  console.log("Watching files/ for changes…");
}

function syncMachineToRepo(fileList) {
  const debounceTimers = new Map();
  const retryIntervals = new Map();

  for (const mapping of fileList) {
    const dest = resolveHome(mapping.dest);

    watch(dest, { recursive: true }, (eventType, filename) => {
      const key = mapping.src;

      if (debounceTimers.has(key)) clearTimeout(debounceTimers.get(key));

      debounceTimers.set(key, setTimeout(async () => {
        debounceTimers.delete(key);
        const src = path.resolve(mapping.src);

        try {
          await fs.cp(dest, src, { recursive: true });
          console.log(`sync: copied ${dest} → ${src}`);
        } catch (e) {
          console.log(`sync: error copying ${dest} → ${src}: ${e.message}`);
          return;
        }

        try {
          await $`git add ${src}`;
          await $`git commit -m ${"auto-sync: update " + path.basename(src)}`;
          console.log(`sync: committed ${path.basename(src)}`);
        } catch (e) {
          console.log(`sync: git commit failed for ${src}: ${e.message}`);
          return;
        }

        const tryPush = async () => {
          try {
            await $`git push`;
            console.log(`sync: pushed`);
            if (retryIntervals.has(key)) {
              clearInterval(retryIntervals.get(key));
              retryIntervals.delete(key);
            }
          } catch (e) {
            console.log(`sync: push failed, will retry in 60s: ${e.message}`);
            if (!retryIntervals.has(key)) {
              retryIntervals.set(key, setInterval(async () => {
                try {
                  await $`git push`;
                  console.log(`sync: retry push succeeded`);
                  clearInterval(retryIntervals.get(key));
                  retryIntervals.delete(key);
                } catch (err) {
                  console.log(`sync: retry push failed: ${err.message}`);
                }
              }, 60000));
            }
          }
        };

        await tryPush();
      }, 2000));
    });
  }

  console.log("Watching destination paths for changes…");
}

// ── Launchd Agents ───────────────────────────────────────────────────────

async function installLaunchdAgents(repoDir) {
  const applied = [], skipped = [], failed = [];

  const agents = [
    { label: "dev.dotfiles.watch", subcommand: "watch", log: "dotfiles-watch.log" },
    { label: "dev.dotfiles.sync", subcommand: "sync", log: "dotfiles-sync.log" },
  ];

  const nodePath = process.execPath;
  const zxPath = path.join(repoDir, "node_modules/.bin/zx");
  const scriptPath = path.join(repoDir, "setup.mjs");

  for (const agent of agents) {
    const plistPath = resolveHome(`~/Library/LaunchAgents/${agent.label}.plist`);
    const logPath = resolveHome(`~/Library/Logs/${agent.log}`);

    const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${agent.label}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${nodePath}</string>
    <string>${zxPath}</string>
    <string>${scriptPath}</string>
    <string>${agent.subcommand}</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${repoDir}</string>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${logPath}</string>
  <key>StandardErrorPath</key>
  <string>${logPath}</string>
</dict>
</plist>
`;

    try {
      let existing = null;
      try {
        existing = await fs.readFile(plistPath, "utf-8");
      } catch {}

      if (existing === plistContent) {
        console.log(`  ✓ ${agent.label}`);
        skipped.push(agent.label);
      } else {
        await fs.mkdir(path.dirname(plistPath), { recursive: true });
        await fs.writeFile(plistPath, plistContent);
        await $`launchctl unload ${plistPath}`.nothrow();
        await $`launchctl load ${plistPath}`;
        console.log(`  ✚ ${agent.label}`);
        applied.push(agent.label);
      }
    } catch (e) {
      console.log(`  ✗ ${agent.label}: ${e.message}`);
      failed.push(agent.label);
    }
  }

  return { applied, skipped, failed };
}

async function main() {
  const subcommand = argv._[0];

  if (subcommand === "watch") {
    watchRepoToMachine(files);
    return;
  }

  if (subcommand === "sync") {
    syncMachineToRepo(files);
    return;
  }

  // Default: apply pipeline
  console.log("Ensuring prerequisites…");
  await ensureBrew();
  await ensureAge();

  console.log("Loading params…");
  const params = await loadParams("~/.config/dotfiles/params.lock.json");

  const results = [];

  console.log("Installing packages…");
  results.push(await applyPackages(packages));

  console.log("Installing casks…");
  results.push(await applyCasks(casks));

  console.log("Creating directories…");
  results.push(await applyDirectories(directories(params)));

  console.log("Cloning git repos…");
  results.push(await applyGitRepos(gitRepos));

  console.log("Syncing config files…");
  results.push(await applyFiles(files));

  console.log("Decrypting secrets…");
  results.push(await applySecrets(secrets));

  console.log("Running commands…");
  results.push(await applyCommands(commands));

  console.log("Setting macOS defaults…");
  results.push(await applyDefaults(defaults));

  console.log("Setting hostname…");
  results.push(await applyHostname());

  console.log("Installing launchd agents…");
  results.push(await installLaunchdAgents(import.meta.dirname));

  printSummary(results);
}

await main();
