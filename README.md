# dotfiles

[dacha](https://github.com/eabrouwer3/dacha)-based system configuration for macOS.

One command installs dacha, clones this repo, and applies the full configuration — packages, GUI apps, shell, terminal, window management, macOS defaults, and secrets.

## Quick Start

```bash
curl -fsSL https://raw.githubusercontent.com/eabrouwer3/dacha/main/install.sh | sh -s -- --repo https://github.com/eabrouwer3/dotfiles
```

## Manual Setup

```bash
# Install dacha
curl -fsSL https://raw.githubusercontent.com/eabrouwer3/dacha/main/install.sh | sh

# Clone and apply
dacha init https://github.com/eabrouwer3/dotfiles
```

## Rebuild

After editing any config file:

```bash
dacha apply
```

## Secrets

Secrets are age-encrypted and stored in `secrets/`. dacha decrypts them using `~/.config/age/identity.txt`.

```bash
# Edit an existing secret
dacha secret edit secrets/node-auth-token.age

# Encrypt a new secret
dacha secret encrypt my-secret.txt --recipients ~/.config/age/recipients.txt
```

## Hammerspoon

Requires Accessibility permissions on first launch — System Settings → Privacy & Security → Accessibility.

## Note

Russian keyboard layout must be added manually via System Settings → Keyboard → Input Sources.
