#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

# ── Data ───────────────────────────────────────────────────────────────────

PACKAGES=(
  cowsay coreutils curl findutils fish fortune gh git
  htop jq krew kubectl kubectx lolcat mise moreutils
  sqlite telnet terminal-notifier terraform tmux tree uv
  awscli vim wget claude-code
)

CASKS=(
  alt-tab audacity battle-net claude copilot discord
  font-monaspace ghostty hammerspoon jetbrains-toolbox keybase
  kiro linear-linear logitech-g-hub minecraft obs obsidian
  ollama orbstack scroll-reverser slack sonos spotify
  steam visual-studio-code vlc zen zoom
)

GIT_REPOS=(
  "eabrouwer3/advent-of-code:$HOME/source/advent-of-code"
  "eabrouwer3/ebrouwer.dev:$HOME/source/ebrouwer.dev"
  "eabrouwer3/project-euler:$HOME/source/project-euler"
)

FILES=(
  "files/fish:$HOME/.config/fish"
  "files/ghostty/config:$HOME/.config/ghostty/config"
  "files/hammerspoon/init.lua:$HOME/.hammerspoon/init.lua"
  "files/tmux/tmux.conf:$HOME/.tmux.conf"
  "files/aws/config:$HOME/.aws/config"
  "files/claude/CLAUDE.md:$HOME/.claude/CLAUDE.md"
  "files/mise/config.toml:$HOME/.config/mise/config.toml"
  "files/kiro/steering:$HOME/.kiro/steering"
  "files/kiro/hooks:$HOME/.kiro/hooks"
  "files/taxbit/tv.json:$HOME/.taxbit/tv.json"
  "files/vim/vimrc:$HOME/.vimrc"
  "files/npm/npmrc:$HOME/.npmrc"
)

SECRETS=(
  "secrets/node-auth-token.age:$HOME/.config/dotfiles/secrets/node-auth-token"
  "secrets/aws-credentials.age:$HOME/.aws/credentials"
  "secrets/kiro-mcp-json.age:$HOME/.kiro/settings/mcp.json"
)
DEFAULTS=(
  "com.apple.finder AppleShowAllFiles -bool true"
  "com.apple.finder FXEnableExtensionChangeWarning -bool false"
  "com.apple.finder FXPreferredViewStyle -string clmv"
  "com.apple.finder ShowPathbar -bool true"
  "com.apple.finder ShowStatusBar -bool true"
  "com.apple.finder _FXShowPosixPathInTitle -bool true"
  "com.apple.finder _FXSortFoldersFirst -bool true"
  "com.apple.finder QuitMenuItem -bool true"
  "com.apple.finder NewWindowTarget -string PfLo"
  "com.apple.finder DisableAllAnimations -bool true"
  "com.apple.dock autohide -bool false"
  "com.apple.dock orientation -string right"
  "com.apple.dock tilesize -int 47"
  "com.apple.dock show-recents -bool false"
  "com.apple.dock minimize-to-application -bool true"
  "com.apple.dock launchanim -bool false"
  "com.apple.dock expose-group-by-app -bool false"
  "com.apple.dock mru-spaces -bool false"
  "com.apple.dock showhidden -bool true"
  "com.apple.dock mineffect -string scale"
  "NSGlobalDomain KeyRepeat -int 2"
  "NSGlobalDomain InitialKeyRepeat -int 35"
  "NSGlobalDomain AppleShowScrollBars -string Always"
  "NSGlobalDomain NSAutomaticCapitalizationEnabled -bool false"
  "NSGlobalDomain NSAutomaticDashSubstitutionEnabled -bool false"
  "NSGlobalDomain NSAutomaticPeriodSubstitutionEnabled -bool false"
  "NSGlobalDomain NSAutomaticQuoteSubstitutionEnabled -bool false"
  "NSGlobalDomain NSAutomaticSpellingCorrectionEnabled -bool false"
  "NSGlobalDomain NSDisableAutomaticTermination -bool true"
  "NSGlobalDomain NSDocumentSaveNewDocumentsToCloud -bool false"
  "NSGlobalDomain NSNavPanelExpandedStateForSaveMode -bool true"
  "NSGlobalDomain NSNavPanelExpandedStateForSaveMode2 -bool true"
  "NSGlobalDomain PMPrintingExpandedStateForPrint -bool true"
  "NSGlobalDomain PMPrintingExpandedStateForPrint2 -bool true"
  "NSGlobalDomain com.apple.mouse.tapBehavior -int 1"
  "NSGlobalDomain AppleFontSmoothing -int 1"
  "NSGlobalDomain AppleKeyboardUIMode -int 3"
  "NSGlobalDomain ApplePressAndHoldEnabled -bool false"
  "NSGlobalDomain NSTableViewDefaultSizeMode -int 2"
  "com.apple.AppleMultitouchTrackpad Clicking -bool true"
  "com.apple.AppleMultitouchTrackpad TrackpadCornerSecondaryClick -int 2"
  "com.apple.AppleMultitouchTrackpad TrackpadRightClick -bool false"
  "com.apple.AppleMultitouchTrackpad TrackpadThreeFingerDrag -bool false"
  "com.apple.desktopservices DSDontWriteNetworkStores -bool true"
  "com.apple.desktopservices DSDontWriteUSBStores -bool true"
  "com.apple.menuextra.clock ShowAMPM -bool true"
  "com.apple.menuextra.clock ShowDate -int 1"
  "com.apple.menuextra.clock ShowDayOfWeek -bool true"
  "com.apple.SoftwareUpdate AutomaticallyInstallMacOSUpdates -bool true"
)

DESIRED_HOSTNAME="MacBook-Pro"
PARAMS_FILE="$HOME/.config/dotfiles/params.lock.json"

# ── Counters & Helpers ─────────────────────────────────────────────────────

applied=0 skipped=0 failed=0

ok()   { echo "  ✓ $1"; ((skipped++)) || true; }
add()  { echo "  ✚ $1"; ((applied++)) || true; }
fail() { echo "  ✗ $1: $2"; ((failed++)) || true; }

file_hash() { shasum -a 256 "$1" 2>/dev/null | awk '{print $1}'; }

load_params() {
  if [[ -f "$PARAMS_FILE" ]]; then
    IS_TAXBIT=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['params']['isTaxbitLaptop'])" "$PARAMS_FILE" 2>/dev/null || echo "False")
  else
    read -rp "Is this a Taxbit laptop? [y/N] " answer
    [[ "$answer" == "y" || "$answer" == "Y" ]] && IS_TAXBIT="True" || IS_TAXBIT="False"
    mkdir -p "$(dirname "$PARAMS_FILE")"
    cat > "$PARAMS_FILE" <<EOF
{
  "version": 1,
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "params": { "isTaxbitLaptop": $( [[ "$IS_TAXBIT" == "True" ]] && echo true || echo false ) }
}
EOF
  fi
}

# ── Steps ──────────────────────────────────────────────────────────────────

ensure_brew() {
  if ! command -v brew &>/dev/null; then
    echo "✚ Installing Homebrew…"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
}

ensure_age() {
  if ! command -v age &>/dev/null; then
    echo "✚ Installing age…"
    brew install age
  fi
}

install_packages() {
  echo "Installing packages…"
  local installed
  installed=$(brew list 2>/dev/null)
  for pkg in "${PACKAGES[@]}"; do
    if echo "$installed" | grep -qx "$pkg"; then
      ok "$pkg"
    elif brew install "$pkg" &>/dev/null; then
      add "$pkg"
    else
      fail "$pkg" "brew install failed"
    fi
  done
}

install_casks() {
  echo "Installing casks…"
  local installed
  installed=$(brew list --cask 2>/dev/null)
  for cask in "${CASKS[@]}"; do
    if echo "$installed" | grep -qx "$cask"; then
      ok "$cask"
    elif brew install --cask "$cask" &>/dev/null; then
      add "$cask"
    else
      fail "$cask" "brew install --cask failed"
    fi
  done
}

create_directories() {
  echo "Creating directories…"
  local dirs=("$HOME/tmp" "$HOME/source")
  [[ "$IS_TAXBIT" == "True" ]] && dirs+=("$HOME/source/taxbit")
  for dir in "${dirs[@]}"; do
    if [[ -d "$dir" ]]; then
      ok "$dir"
    elif mkdir -p "$dir"; then
      add "$dir"
    else
      fail "$dir" "mkdir failed"
    fi
  done
}

clone_repos() {
  echo "Cloning git repos…"
  for entry in "${GIT_REPOS[@]}"; do
    local repo="${entry%%:*}" dest="${entry#*:}"
    if [[ -d "$dest/.git" ]]; then
      ok "$repo"
    elif git clone "https://github.com/${repo}.git" "$dest" &>/dev/null; then
      add "$repo"
    else
      fail "$repo" "git clone failed"
    fi
  done
}

sync_files() {
  echo "Syncing config files…"
  for entry in "${FILES[@]}"; do
    local src="${entry%%:*}" dest="${entry#*:}"
    local abs_src="$REPO_DIR/$src"
    if [[ -d "$abs_src" ]]; then
      if [[ -d "$dest" ]]; then ok "$dest"
      elif mkdir -p "$(dirname "$dest")" && cp -R "$abs_src" "$dest"; then add "$dest"
      else fail "$dest" "copy failed"; fi
    elif [[ -f "$abs_src" ]]; then
      if [[ "$(file_hash "$abs_src")" == "$(file_hash "$dest")" ]]; then ok "$dest"
      elif mkdir -p "$(dirname "$dest")" && cp "$abs_src" "$dest"; then add "$dest"
      else fail "$dest" "copy failed"; fi
    else
      fail "$dest" "source not found: $src"
    fi
  done
}

decrypt_secrets() {
  echo "Decrypting secrets…"
  for entry in "${SECRETS[@]}"; do
    local src="${entry%%:*}" dest="${entry#*:}"
    if [[ -f "$dest" ]]; then
      ok "$dest"
    elif mkdir -p "$(dirname "$dest")" && age -d -i "$HOME/.ssh/id_rsa" "$src" > "$dest" 2>/dev/null; then
      chmod 600 "$dest"
      add "$dest"
    else
      fail "$dest" "age decrypt failed"
    fi
  done
}

run_commands() {
  echo "Running commands…"
  # fisher
  if fish -c 'functions -q fisher' &>/dev/null; then
    ok "fisher-bootstrap"
  elif fish -c '
    curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source
    fisher install jorgebucaran/fisher
    fisher update
    tide configure --auto --style=Rainbow --prompt_colors="True color" --show_time=No --rainbow_prompt_separators=Angled --powerline_prompt_heads=Sharp --powerline_prompt_tails=Flat --powerline_prompt_style="Two lines, character" --prompt_connection=Solid --powerline_right_prompt_frame=No --prompt_connection_andor_frame_color=Dark --prompt_spacing=Sparse --icons="Many icons" --transient=No
  ' &>/dev/null; then
    add "fisher-bootstrap"
  else
    fail "fisher-bootstrap" "fish command failed"
  fi
  # krew
  if kubectl-krew list 2>/dev/null | grep -q "^access-matrix "; then
    ok "krew-plugins"
  else
    export PATH="$HOME/.krew/bin:$PATH"
    for plugin in access-matrix deprecations get-all outdated tail who-can; do
      kubectl-krew install "$plugin" 2>/dev/null || true
    done
    if kubectl-krew list 2>/dev/null | grep -q "^access-matrix "; then
      add "krew-plugins"
    else
      fail "krew-plugins" "install failed"
    fi
  fi
}

apply_defaults() {
  echo "Setting macOS defaults…"
  for entry in "${DEFAULTS[@]}"; do
    read -r domain key type value <<< "$entry"
    local id="$domain:$key"
    local current desired="$value"
    current=$(defaults read "$domain" "$key" 2>/dev/null || echo "")
    [[ "$type" == "-bool" ]] && { [[ "$value" == "true" ]] && desired="1" || desired="0"; }
    if [[ "$current" == "$desired" ]]; then
      ok "$id"
    elif defaults write "$domain" "$key" "$type" "$value" 2>/dev/null; then
      add "$id"
    else
      fail "$id" "defaults write failed"
    fi
  done
  # Caps Lock → Input Source toggle
  if defaults write com.apple.symbolichotkeys AppleSymbolicHotKeys -dict-add 61 \
    '<dict><key>enabled</key><true/><key>value</key><dict><key>parameters</key><array><integer>65535</integer><integer>57</integer><integer>8388608</integer></array><key>type</key><string>standard</string></dict></dict>' 2>/dev/null; then
    add "capslock-input-source"
  else
    fail "capslock-input-source" "defaults write failed"
  fi
}

set_hostname() {
  echo "Setting hostname…"
  local current
  current=$(scutil --get ComputerName 2>/dev/null || echo "")
  if [[ "$current" == "$DESIRED_HOSTNAME" ]]; then
    ok "hostname"
  elif sudo scutil --set ComputerName "$DESIRED_HOSTNAME" &&
       sudo scutil --set HostName "$DESIRED_HOSTNAME" &&
       sudo scutil --set LocalHostName "$DESIRED_HOSTNAME"; then
    add "hostname"
  else
    fail "hostname" "scutil failed"
  fi
}

# ── Main ───────────────────────────────────────────────────────────────────

main() {
  echo "Ensuring prerequisites…"
  ensure_brew
  ensure_age

  echo "Loading params…"
  load_params

  install_packages
  install_casks
  create_directories
  clone_repos
  sync_files
  decrypt_secrets
  run_commands
  apply_defaults
  set_hostname

  echo ""
  echo "$applied applied, $skipped skipped, $failed failed"
}

main "$@"
