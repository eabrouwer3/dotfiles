# Environment variables
set -gx BAT_THEME base16
set -gx GPG_TTY (tty)
set -gx BUN_INSTALL $HOME/.bun

# PATH additions
fish_add_path $HOME/.cargo/bin
fish_add_path $HOME/.foundry/bin
fish_add_path /usr/local/opt/gnu-sed/libexec/gnubin
fish_add_path $HOME/.local/bin
fish_add_path $HOME/.krew/bin
fish_add_path $HOME/.bun/bin

# mise activation
mise activate fish | source

# SSH keys
ssh-add -q ~/.ssh/id_rsa
ssh-add -q ~/.ssh/bastion-staging.cer
ssh-add -q ~/.ssh/bastion-prod.cer

# NODE_AUTH_TOKEN from decrypted secret
if test -f ~/.config/dacha/secrets/node-auth-token
  set -gx NODE_AUTH_TOKEN (cat ~/.config/dacha/secrets/node-auth-token)
end

# Machine-specific integrations (uncomment as needed):
# OrbStack: source ~/.orbstack/shell/init.fish
# gcloud SDK: source /opt/homebrew/share/google-cloud-sdk/path.fish.inc
# Kiro CLI: (add kiro CLI path if needed)
# ghcup: set -gx GHCUP_INSTALL_BASE_PREFIX $HOME; fish_add_path $HOME/.ghcup/bin
