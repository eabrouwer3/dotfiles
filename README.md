# dotfiles

Single bash script for macOS system configuration. One file (`setup.sh`) manages everything: brew packages, cask apps, config files, age-encrypted secrets, git repos, directories, shell commands, macOS defaults, and hostname.

## Fresh Machine Setup

```bash
# 1. Install Xcode command line tools (for git)
xcode-select --install

# 2. Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 3. Clone this repo
git clone https://github.com/eabrouwer3/dotfiles ~/source/dotfiles
cd ~/source/dotfiles

# 4. Run setup
./setup.sh
```

The script will:
- Install Homebrew and age if missing
- Ask if this is a Taxbit laptop (answer saved to `~/.config/dotfiles/params.lock.json`)
- Install all brew packages and cask apps
- Create directories, clone git repos
- Copy config files and decrypt secrets
- Run shell commands (fisher, krew plugins)
- Set macOS defaults and hostname

## Subsequent Runs

```bash
cd ~/source/dotfiles
./setup.sh
```

The script is idempotent — it checks current state before applying anything, so running it repeatedly is safe.

## Secrets

Secrets are age-encrypted in `secrets/` and decrypted using `~/.ssh/id_rsa` as the age identity file.

## Notes

- Hammerspoon requires Accessibility permissions — System Settings → Privacy & Security → Accessibility
- Russian keyboard layout must be added manually via System Settings → Keyboard → Input Sources
