# Requirements Document

## Introduction

Replace the dacha (Deno-based) dotfiles management system with a self-contained zx (Node.js) script. The zx script manages the full MacBook Pro system configuration: brew packages, cask apps, config files, age-encrypted secrets, git repos, directories, shell commands, and macOS defaults. It supports a params lockfile for conditional configuration (Taxbit laptop), bidirectional file watching with auto-sync, and idempotent execution. All work targets a new `zx` git branch.

## Glossary

- **Script**: The main zx-based entry point (`setup.mjs`) that orchestrates all system configuration
- **Resource**: A single unit of system state (package, file, directory, secret, command, macOS default, git repo, or cask)
- **Lockfile**: A JSON file at `~/.config/dotfiles/params.lock.json` storing user-provided parameters (e.g., `isTaxbitLaptop`) so prompts only occur on first run
- **Sync_Daemon**: A background process that watches managed files for changes and auto-commits them back to the dotfiles repo
- **Apply**: The process of checking each Resource's current state and converging it to the desired state if needed
- **Watcher**: A file-system watcher (chokidar or Node fs.watch) that detects changes to managed files
- **Identity_File**: The age private key at `~/.ssh/id_rsa` used to decrypt secrets

## Requirements

### Requirement 1: Project Structure

**User Story:** As a developer, I want the dotfiles repo to be self-contained with a `package.json` and zx script, so that I no longer depend on the external dacha/Deno toolchain.

#### Acceptance Criteria

1. THE Script SHALL be defined in a `setup.mjs` file at the repo root, executable via `npx zx setup.mjs`
2. THE repo SHALL contain a `package.json` with `zx` as a dependency and a `"setup"` script that runs `zx setup.mjs`
3. THE repo SHALL contain an `.nvmrc` file specifying the Node.js version
4. WHEN the Script is run, THE Script SHALL operate correctly with paths relative to the repo root regardless of the caller's working directory

### Requirement 2: Prerequisite Auto-Installation

**User Story:** As a developer, I want brew and age to be installed automatically if missing, so that I can bootstrap a fresh Mac with zero manual steps.

#### Acceptance Criteria

1. WHEN brew is not found on the system, THE Script SHALL install Homebrew via the official install script before proceeding
2. WHEN age is not found on the system, THE Script SHALL install age via `brew install age` before decrypting secrets
3. WHEN brew is already installed, THE Script SHALL skip the Homebrew installation step
4. WHEN age is already installed, THE Script SHALL skip the age installation step

### Requirement 3: Params Lockfile

**User Story:** As a developer, I want to be prompted once about whether this is a Taxbit laptop, with the answer persisted in a lockfile, so that subsequent runs are non-interactive.

#### Acceptance Criteria

1. WHEN the Lockfile does not exist, THE Script SHALL prompt the user with "Is this a Taxbit laptop? [y/N]" and write the response to `~/.config/dotfiles/params.lock.json`
2. WHEN the Lockfile exists, THE Script SHALL read the `isTaxbitLaptop` parameter from the Lockfile without prompting
3. THE Lockfile SHALL contain a JSON object with `version`, `createdAt`, and `params` fields
4. WHEN `isTaxbitLaptop` is true, THE Script SHALL create the `~/source/taxbit` directory

### Requirement 4: Brew Package Management

**User Story:** As a developer, I want all my CLI tools installed via brew, so that my development environment is consistent.

#### Acceptance Criteria

1. FOR EACH defined brew package, WHEN the package is not installed, THE Script SHALL run `brew install <package>`
2. FOR EACH defined brew package, WHEN the package is already installed, THE Script SHALL skip installation of that package
3. THE Script SHALL manage the following packages: cowsay, coreutils, curl, findutils, fish, fortune, gh, git, htop, jq, krew, kubectl, kubectx, lolcat, mise, moreutils, sqlite, telnet, terminal-notifier, terraform, tmux, tree, uv, awscli, vim, wget, claude-code

### Requirement 5: Brew Cask Management

**User Story:** As a developer, I want all my GUI apps installed via brew cask, so that my application suite is consistent.

#### Acceptance Criteria

1. FOR EACH defined cask, WHEN the cask is not installed, THE Script SHALL run `brew install --cask <cask>`
2. FOR EACH defined cask, WHEN the cask is already installed, THE Script SHALL skip installation of that cask
3. THE Script SHALL manage the following casks: alt-tab, audacity, battle-net, claude, copilot, discord, font-monaspace, ghostty, hammerspoon, jetbrains-toolbox, keybase, kiro, linear-linear, logitech-g-hub, minecraft, obs, obsidian, ollama, orbstack, scroll-reverser, slack, sonos, spotify, steam, visual-studio-code, vlc, zen, zoom

### Requirement 6: Directory Management

**User Story:** As a developer, I want required directories created automatically, so that file and repo operations have their parent directories in place.

#### Acceptance Criteria

1. THE Script SHALL create `~/tmp` and `~/source` directories if they do not exist
2. WHEN `isTaxbitLaptop` is true, THE Script SHALL create `~/source/taxbit`
3. WHEN a directory already exists, THE Script SHALL skip creation of that directory

### Requirement 7: Git Repository Cloning

**User Story:** As a developer, I want my personal repos cloned automatically, so that my source tree is ready after setup.

#### Acceptance Criteria

1. FOR EACH defined git repo, WHEN the `.git` directory does not exist at the destination, THE Script SHALL clone the repo via `git clone`
2. FOR EACH defined git repo, WHEN the `.git` directory already exists at the destination, THE Script SHALL skip cloning
3. THE Script SHALL clone the following repos into `~/source/`: advent-of-code, ebrouwer.dev, project-euler (all from `eabrouwer3` GitHub account)
4. THE Script SHALL create the `~/source` directory before attempting to clone repos into it

### Requirement 8: Config File Sync (Repo → Machine)

**User Story:** As a developer, I want my dotfiles copied from the repo to their system destinations, so that my shell, editor, and tool configs are applied.

#### Acceptance Criteria

1. FOR EACH defined file mapping, WHEN the source file hash differs from the destination file hash (SHA-256), THE Script SHALL copy the source to the destination
2. FOR EACH defined file mapping, WHEN the source and destination hashes match, THE Script SHALL skip the copy
3. WHEN the source is a directory, THE Script SHALL recursively copy the directory to the destination
4. THE Script SHALL create parent directories at the destination if they do not exist
5. THE Script SHALL manage the following file mappings: fish config dir, ghostty config, hammerspoon init.lua, tmux.conf, aws config, CLAUDE.md, mise config.toml, kiro steering dir, kiro hooks dir, taxbit tv.json, vimrc, npmrc

### Requirement 9: Secret Decryption

**User Story:** As a developer, I want age-encrypted secrets decrypted and placed at their destinations, so that credentials are available without manual steps.

#### Acceptance Criteria

1. FOR EACH defined secret, WHEN the destination file does not exist, THE Script SHALL decrypt the source using `age -d -i ~/.ssh/id_rsa <source>` and write the output to the destination
2. FOR EACH defined secret, WHEN the destination file already exists, THE Script SHALL skip decryption
3. THE Script SHALL set file permissions to `0600` on decrypted secret files
4. THE Script SHALL create parent directories at the destination if they do not exist
5. THE Script SHALL manage the following secrets: node-auth-token (→ `~/.config/dotfiles/secrets/node-auth-token`), aws-credentials (→ `~/.aws/credentials`), kiro-mcp-json (→ `~/.kiro/settings/mcp.json`)

### Requirement 10: Shell Commands

**User Story:** As a developer, I want fisher bootstrap and krew plugins installed automatically, so that my shell and kubectl extensions are ready.

#### Acceptance Criteria

1. WHEN fisher is not installed, THE Script SHALL install fisher and run `fisher update`, then configure tide prompt
2. WHEN fisher is already installed, THE Script SHALL skip fisher installation
3. WHEN krew plugins are not fully installed, THE Script SHALL install the missing krew plugins (access-matrix, deprecations, get-all, outdated, tail, who-can)
4. WHEN all krew plugins are already installed, THE Script SHALL skip krew plugin installation
5. THE Script SHALL run fisher bootstrap only after the fish config files have been copied

### Requirement 11: macOS Defaults

**User Story:** As a developer, I want macOS system preferences set automatically, so that Finder, Dock, trackpad, and keyboard behave the way I prefer.

#### Acceptance Criteria

1. FOR EACH defined macOS default, WHEN the current value differs from the desired value, THE Script SHALL run `defaults write <domain> <key> <type> <value>`
2. FOR EACH defined macOS default, WHEN the current value matches the desired value, THE Script SHALL skip the write
3. THE Script SHALL manage defaults for the following domains: com.apple.finder, com.apple.dock, NSGlobalDomain, com.apple.AppleMultitouchTrackpad, com.apple.desktopservices, com.apple.menuextra.clock, com.apple.SoftwareUpdate
4. THE Script SHALL set the Caps Lock key to toggle input source via symbolic hotkeys
5. THE Script SHALL set the hostname to "MacBook-Pro" via `scutil` if it is not already set

### Requirement 12: Idempotency

**User Story:** As a developer, I want the script to be safe to run repeatedly, so that running it 1000 times produces the same result as running it once.

#### Acceptance Criteria

1. FOR EACH Resource, THE Script SHALL check the current state before applying changes
2. FOR EACH Resource, WHEN the current state matches the desired state, THE Script SHALL skip that Resource
3. THE Script SHALL produce no side effects when run against an already-converged system
4. THE Script SHALL report which Resources were applied, skipped, or failed

### Requirement 13: Watch Mode (Repo → Machine)

**User Story:** As a developer, I want to watch the dotfiles repo for changes and auto-sync them to the machine, so that edits to the repo are reflected immediately.

#### Acceptance Criteria

1. WHEN the Script is invoked with a `watch` subcommand, THE Script SHALL watch all source files in the `files/` directory for changes
2. WHEN a watched source file changes, THE Script SHALL copy the changed file to its corresponding destination on the machine
3. THE Watcher SHALL debounce file change events with a 2-second delay to avoid redundant copies

### Requirement 14: Watch Mode (Machine → Repo)

**User Story:** As a developer, I want local config file changes auto-committed back to the dotfiles repo, so that my repo stays in sync with my machine.

#### Acceptance Criteria

1. WHEN the Script is invoked with a `sync` subcommand, THE Script SHALL watch all destination paths (managed files on the machine) for changes
2. WHEN a watched destination file changes, THE Script SHALL copy the changed file back to its corresponding source in the repo
3. WHEN a destination file is synced back, THE Script SHALL run `git add`, `git commit` with message "auto-sync: update <filename>", and `git push`
4. THE Watcher SHALL debounce file change events with a 2-second delay
5. IF a `git push` fails, THEN THE Script SHALL retry the push every 60 seconds

### Requirement 15: Launchd Daemon Integration

**User Story:** As a developer, I want the watch and sync modes to run automatically on login via launchd, so that my dotfiles stay in sync without me having to manually start anything.

#### Acceptance Criteria

1. WHEN the apply pipeline completes, THE Script SHALL install two macOS launchd agents: one for `watch` mode and one for `sync` mode
2. THE launchd agents SHALL be written to `~/Library/LaunchAgents/dev.dotfiles.watch.plist` and `~/Library/LaunchAgents/dev.dotfiles.sync.plist`
3. THE launchd agents SHALL use `KeepAlive` so they restart automatically if they crash
4. THE launchd agents SHALL log stdout and stderr to `~/Library/Logs/dotfiles-watch.log` and `~/Library/Logs/dotfiles-sync.log`
5. WHEN the plist files already exist with the correct content, THE Script SHALL skip reinstallation (idempotent)
6. THE Script SHALL run `launchctl load` to activate the agents after writing the plist files

### Requirement 16: Git Branch

**User Story:** As a developer, I want all zx-based changes on a dedicated `zx` branch, so that the migration is isolated from the main branch.

#### Acceptance Criteria

1. THE Script, `package.json`, `.nvmrc`, and all new files SHALL be committed to a branch named `zx`
2. THE `dacha.config.ts` and `deno.json` files SHALL remain unchanged on the `zx` branch (they can be removed in a future cleanup)
