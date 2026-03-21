# dotfiles

Single-script macOS system configuration powered by [zx](https://google.github.io/zx/). One file (`setup.mjs`) manages everything: brew packages, cask apps, config files, age-encrypted secrets, git repos, directories, shell commands, macOS defaults, and launchd daemons.

## Fresh Machine Setup

On a brand new Mac with nothing installed:

```bash
# 1. Install Xcode command line tools (for git)
xcode-select --install

# 2. Clone this repo
git clone https://github.com/eabrouwer3/dotfiles ~/source/dotfiles
cd ~/source/dotfiles

# 3. Install nvm (if not already present)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# 4. Install Node.js and dependencies
nvm install
npm install

# 5. Run setup
npm run setup
```

The script will:
- Install Homebrew and age if missing
- Ask if this is a Taxbit laptop (answer saved to `~/.config/dotfiles/params.lock.json`)
- Install all brew packages and cask apps
- Create directories, clone git repos
- Copy config files and decrypt secrets
- Run shell commands (fisher, krew plugins)
- Set macOS defaults and hostname
- Install launchd agents for file watching

## Subsequent Runs

```bash
cd ~/source/dotfiles
npm run setup
```

The script is idempotent — it checks current state before applying anything, so running it repeatedly is safe.

## Watch & Sync

Two background modes run automatically via launchd after the first setup:

- `watch` — monitors `files/` in the repo and copies changes to the machine
- `sync` — monitors config files on the machine and auto-commits changes back to the repo

These are installed as launchd agents and start on login. Logs are at `~/Library/Logs/dotfiles-watch.log` and `~/Library/Logs/dotfiles-sync.log`.

To run manually:

```bash
npx zx setup.mjs watch
npx zx setup.mjs sync
```

## Secrets

Secrets are age-encrypted in `secrets/` and decrypted using `~/.ssh/id_rsa` as the age identity file.

## Notes

- Hammerspoon requires Accessibility permissions — System Settings → Privacy & Security → Accessibility
- Russian keyboard layout must be added manually via System Settings → Keyboard → Input Sources
