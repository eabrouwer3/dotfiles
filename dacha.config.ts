// dacha.config.ts — MacBook Pro system configuration
// Uses the dacha v2 class-based API with Machine subclassing.

import {
  Machine,
  Package,
  BrewCaskPackage,
  File,
  Directory,
  Command,
  Secret,
  MacDefault,
  GitRepo,
} from "@eabrouwer3/dacha";
import type { Params } from "@eabrouwer3/dacha";

class MacBookPro extends Machine {
  static override params = [
    { name: "isTaxbitLaptop", message: "Is this a Taxbit laptop?", type: "confirm" as const, default: false },
  ];

  constructor(params: Params = {}) {
    super();

    // ── CLI Tools ──────────────────────────────────────────────────

    new Package(this, "cowsay", { name: "cowsay" });
    new Package(this, "coreutils", { name: "coreutils" });
    new Package(this, "curl", { name: "curl" });
    new Package(this, "findutils", { name: "findutils" });
    const fish = new Package(this, "fish", { name: "fish" });
    new Package(this, "fortune", { name: "fortune" });
    new Package(this, "gh", { name: "gh" });
    new Package(this, "git", { name: "git" });
    new Package(this, "htop", { name: "htop" });
    new Package(this, "jq", { name: "jq" });
    const krew = new Package(this, "krew", { name: "krew" });
    const kubectl = new Package(this, "kubectl", { name: "kubectl" });
    new Package(this, "kubectx", { name: "kubectx" });
    new Package(this, "lolcat", { name: "lolcat" });
    new Package(this, "mise", { name: "mise" });
    new Package(this, "moreutils", { name: "moreutils" });
    new Package(this, "sqlite", { name: "sqlite" });
    new Package(this, "telnet", { name: "telnet" });
    new Package(this, "terminal-notifier", { name: "terminal-notifier" });
    new Package(this, "terraform", { name: "terraform" });
    new Package(this, "tmux", { name: "tmux" });
    new Package(this, "tree", { name: "tree" });
    new Package(this, "uv", { name: "uv" });
    new Package(this, "awscli", { name: "awscli" });
    new Package(this, "vim", { name: "vim" });
    new Package(this, "wget", { name: "wget" });
    new Package(this, "claude-code", { name: "claude-code" });

    // ── GUI Apps (Casks) ───────────────────────────────────────────

    new BrewCaskPackage(this, "alt-tab", { name: "alt-tab" });
    new BrewCaskPackage(this, "audacity", { name: "audacity" });
    new BrewCaskPackage(this, "battle-net", { name: "battle-net" });
    new BrewCaskPackage(this, "claude", { name: "claude" });
    new BrewCaskPackage(this, "copilot", { name: "copilot" });
    new BrewCaskPackage(this, "discord", { name: "discord" });
    new BrewCaskPackage(this, "font-monaspace", { name: "font-monaspace" });
    new BrewCaskPackage(this, "ghostty", { name: "ghostty" });
    new BrewCaskPackage(this, "hammerspoon", { name: "hammerspoon" });
    new BrewCaskPackage(this, "jetbrains-toolbox", { name: "jetbrains-toolbox" });
    new BrewCaskPackage(this, "keybase", { name: "keybase" });
    new BrewCaskPackage(this, "kiro", { name: "kiro" });
    new BrewCaskPackage(this, "linear", { name: "linear-linear" });
    new BrewCaskPackage(this, "logitech-g-hub", { name: "logitech-g-hub" });
    new BrewCaskPackage(this, "minecraft", { name: "minecraft" });
    new BrewCaskPackage(this, "obs", { name: "obs" });
    new BrewCaskPackage(this, "obsidian", { name: "obsidian" });
    new BrewCaskPackage(this, "ollama", { name: "ollama" });
    new BrewCaskPackage(this, "orbstack", { name: "orbstack" });
    new BrewCaskPackage(this, "scroll-reverser", { name: "scroll-reverser" });
    new BrewCaskPackage(this, "slack", { name: "slack" });
    new BrewCaskPackage(this, "sonos", { name: "sonos" });
    new BrewCaskPackage(this, "spotify", { name: "spotify" });
    new BrewCaskPackage(this, "steam", { name: "steam" });
    new BrewCaskPackage(this, "visual-studio-code", { name: "visual-studio-code" });
    new BrewCaskPackage(this, "vlc", { name: "vlc" });
    new BrewCaskPackage(this, "zen", { name: "zen" });
    new BrewCaskPackage(this, "zoom", { name: "zoom" });

    // ── Directories ────────────────────────────────────────────────

    new Directory(this, "tmp-dir", { destination: "~/tmp" });
    const sourceDir = new Directory(this, "source-dir", { destination: "~/source" });
    if (params.isTaxbitLaptop) {
      new Directory(this, "taxbit-source-dir", { destination: "~/source/taxbit" });
    }

    // ── Git Repos ──────────────────────────────────────────────────

    new GitRepo(this, "advent-of-code", { repo: "eabrouwer3/advent-of-code", destination: "~/source/advent-of-code", dependsOn: [sourceDir] });
    new GitRepo(this, "ebrouwer-dev", { repo: "eabrouwer3/ebrouwer.dev", destination: "~/source/ebrouwer.dev", dependsOn: [sourceDir] });
    new GitRepo(this, "project-euler", { repo: "eabrouwer3/project-euler", destination: "~/source/project-euler", dependsOn: [sourceDir] });

    // ── Files ───────────────────────────────────────────────────────

    const fishConfig = new File(this, "fish-config", { source: "./files/fish", destination: "~/.config/fish", dependsOn: [fish] });
    new File(this, "ghostty-config", { source: "./files/ghostty/config", destination: "~/.config/ghostty/config" });
    new File(this, "hammerspoon-init", { source: "./files/hammerspoon/init.lua", destination: "~/.hammerspoon/init.lua" });
    new File(this, "tmux-config", { source: "./files/tmux/tmux.conf", destination: "~/.tmux.conf" });
    new File(this, "aws-config", { source: "./files/aws/config", destination: "~/.aws/config" });
    new File(this, "claude-md", { source: "./files/claude/CLAUDE.md", destination: "~/.claude/CLAUDE.md" });
    new File(this, "mise-config", { source: "./files/mise/config.toml", destination: "~/.config/mise/config.toml" });
    new File(this, "kiro-steering", { source: "./files/kiro/steering", destination: "~/.kiro/steering" });
    new File(this, "kiro-hooks", { source: "./files/kiro/hooks", destination: "~/.kiro/hooks" });
    new File(this, "taxbit-tv", { source: "./files/taxbit/tv.json", destination: "~/.taxbit/tv.json" });
    new File(this, "vimrc", { source: "./files/vim/vimrc", destination: "~/.vimrc" });

    // ── Secrets ─────────────────────────────────────────────────────

    new Secret(this, "node-auth-token", {
      source: "./secrets/node-auth-token.age",
      destination: "~/.config/dacha/secrets/node-auth-token",
      permissions: "0600",
    });

    new Secret(this, "aws-credentials", {
      source: "./secrets/aws-credentials.age",
      destination: "~/.aws/credentials",
      permissions: "0600",
    });

    new Secret(this, "kiro-mcp-json", {
      source: "./secrets/kiro-mcp-json.age",
      destination: "~/.kiro/settings/mcp.json",
      permissions: "0600",
    });

    new File(this, "npmrc", { source: "./files/npm/npmrc", destination: "~/.npmrc" });

    // ── Commands ────────────────────────────────────────────────────

    new Command(this, "fisher-bootstrap", {
      run: `fish -c '
        if not functions -q fisher
          curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source
          fisher install jorgebucaran/fisher
        end
        fisher update
        tide configure --auto --style=Rainbow --prompt_colors="True color" --show_time=No --rainbow_prompt_separators=Angled --powerline_prompt_heads=Sharp --powerline_prompt_tails=Flat --powerline_prompt_style="Two lines, character" --prompt_connection=Solid --powerline_right_prompt_frame=No --prompt_connection_andor_frame_color=Dark --prompt_spacing=Sparse --icons="Many icons" --transient=No
      '`,
      check: "fish -c 'functions -q fisher'",
      dependsOn: [fishConfig],
    });

    new Command(this, "krew-plugins", {
      run: `
        export PATH="$HOME/.krew/bin:$PATH"
        for plugin in access-matrix deprecations get-all outdated tail who-can; do
          if ! kubectl-krew list 2>/dev/null | grep -q "^$plugin "; then
            kubectl-krew install "$plugin" 2>/dev/null || true
          fi
        done
      `,
      check: `kubectl-krew list 2>/dev/null | grep -q "^access-matrix "`,
      dependsOn: [krew, kubectl],
    });

    // ── macOS Defaults ──────────────────────────────────────────────

    // Finder
    new MacDefault(this, "finder-show-all-files", { domain: "com.apple.finder", key: "AppleShowAllFiles", value: true });
    new MacDefault(this, "finder-no-ext-change-warning", { domain: "com.apple.finder", key: "FXEnableExtensionChangeWarning", value: false });
    new MacDefault(this, "finder-column-view", { domain: "com.apple.finder", key: "FXPreferredViewStyle", value: "clmv" });
    new MacDefault(this, "finder-show-pathbar", { domain: "com.apple.finder", key: "ShowPathbar", value: true });
    new MacDefault(this, "finder-show-statusbar", { domain: "com.apple.finder", key: "ShowStatusBar", value: true });
    new MacDefault(this, "finder-posix-title", { domain: "com.apple.finder", key: "_FXShowPosixPathInTitle", value: true });
    new MacDefault(this, "finder-folders-first", { domain: "com.apple.finder", key: "_FXSortFoldersFirst", value: true });
    new MacDefault(this, "finder-quit-menu", { domain: "com.apple.finder", key: "QuitMenuItem", value: true });
    new MacDefault(this, "finder-new-window-target", { domain: "com.apple.finder", key: "NewWindowTarget", value: "PfLo" });
    new MacDefault(this, "finder-no-animations", { domain: "com.apple.finder", key: "DisableAllAnimations", value: true });

    // Dock
    new MacDefault(this, "dock-no-autohide", { domain: "com.apple.dock", key: "autohide", value: false });
    new MacDefault(this, "dock-orientation", { domain: "com.apple.dock", key: "orientation", value: "right" });
    new MacDefault(this, "dock-tilesize", { domain: "com.apple.dock", key: "tilesize", value: 47 });
    new MacDefault(this, "dock-no-recents", { domain: "com.apple.dock", key: "show-recents", value: false });
    new MacDefault(this, "dock-minimize-to-app", { domain: "com.apple.dock", key: "minimize-to-application", value: true });
    new MacDefault(this, "dock-no-launchanim", { domain: "com.apple.dock", key: "launchanim", value: false });
    new MacDefault(this, "dock-no-expose-group", { domain: "com.apple.dock", key: "expose-group-by-app", value: false });
    new MacDefault(this, "dock-no-mru-spaces", { domain: "com.apple.dock", key: "mru-spaces", value: false });
    new MacDefault(this, "dock-show-hidden", { domain: "com.apple.dock", key: "showhidden", value: true });
    new MacDefault(this, "dock-scale-effect", { domain: "com.apple.dock", key: "mineffect", value: "scale" });

    // NSGlobalDomain
    new MacDefault(this, "global-key-repeat", { domain: "NSGlobalDomain", key: "KeyRepeat", value: 2 });
    new MacDefault(this, "global-initial-key-repeat", { domain: "NSGlobalDomain", key: "InitialKeyRepeat", value: 35 });
    new MacDefault(this, "global-show-scrollbars", { domain: "NSGlobalDomain", key: "AppleShowScrollBars", value: "Always" });
    new MacDefault(this, "global-no-auto-capitalize", { domain: "NSGlobalDomain", key: "NSAutomaticCapitalizationEnabled", value: false });
    new MacDefault(this, "global-no-auto-dash", { domain: "NSGlobalDomain", key: "NSAutomaticDashSubstitutionEnabled", value: false });
    new MacDefault(this, "global-no-auto-period", { domain: "NSGlobalDomain", key: "NSAutomaticPeriodSubstitutionEnabled", value: false });
    new MacDefault(this, "global-no-auto-quote", { domain: "NSGlobalDomain", key: "NSAutomaticQuoteSubstitutionEnabled", value: false });
    new MacDefault(this, "global-no-auto-spelling", { domain: "NSGlobalDomain", key: "NSAutomaticSpellingCorrectionEnabled", value: false });
    new MacDefault(this, "global-no-auto-terminate", { domain: "NSGlobalDomain", key: "NSDisableAutomaticTermination", value: true });
    new MacDefault(this, "global-no-cloud-save", { domain: "NSGlobalDomain", key: "NSDocumentSaveNewDocumentsToCloud", value: false });
    new MacDefault(this, "global-expand-save-panel", { domain: "NSGlobalDomain", key: "NSNavPanelExpandedStateForSaveMode", value: true });
    new MacDefault(this, "global-expand-save-panel2", { domain: "NSGlobalDomain", key: "NSNavPanelExpandedStateForSaveMode2", value: true });
    new MacDefault(this, "global-expand-print-panel", { domain: "NSGlobalDomain", key: "PMPrintingExpandedStateForPrint", value: true });
    new MacDefault(this, "global-expand-print-panel2", { domain: "NSGlobalDomain", key: "PMPrintingExpandedStateForPrint2", value: true });
    new MacDefault(this, "global-tap-to-click", { domain: "NSGlobalDomain", key: "com.apple.mouse.tapBehavior", value: 1 });
    new MacDefault(this, "global-font-smoothing", { domain: "NSGlobalDomain", key: "AppleFontSmoothing", value: 1 });
    new MacDefault(this, "global-full-keyboard-access", { domain: "NSGlobalDomain", key: "AppleKeyboardUIMode", value: 3 });
    new MacDefault(this, "global-no-press-and-hold", { domain: "NSGlobalDomain", key: "ApplePressAndHoldEnabled", value: false });
    new MacDefault(this, "global-sidebar-icon-size", { domain: "NSGlobalDomain", key: "NSTableViewDefaultSizeMode", value: 2 });

    // Trackpad
    new MacDefault(this, "trackpad-tap-to-click", { domain: "com.apple.AppleMultitouchTrackpad", key: "Clicking", value: true });
    new MacDefault(this, "trackpad-corner-secondary-click", { domain: "com.apple.AppleMultitouchTrackpad", key: "TrackpadCornerSecondaryClick", value: 2 });
    new MacDefault(this, "trackpad-no-right-click", { domain: "com.apple.AppleMultitouchTrackpad", key: "TrackpadRightClick", value: false });
    new MacDefault(this, "trackpad-no-three-finger-drag", { domain: "com.apple.AppleMultitouchTrackpad", key: "TrackpadThreeFingerDrag", value: false });

    // Desktop Services
    new MacDefault(this, "ds-no-network-stores", { domain: "com.apple.desktopservices", key: "DSDontWriteNetworkStores", value: true });
    new MacDefault(this, "ds-no-usb-stores", { domain: "com.apple.desktopservices", key: "DSDontWriteUSBStores", value: true });

    // Menu bar clock
    new MacDefault(this, "clock-show-ampm", { domain: "com.apple.menuextra.clock", key: "ShowAMPM", value: true });
    new MacDefault(this, "clock-show-date", { domain: "com.apple.menuextra.clock", key: "ShowDate", value: 1 });
    new MacDefault(this, "clock-show-day-of-week", { domain: "com.apple.menuextra.clock", key: "ShowDayOfWeek", value: true });

    // Software Update
    new MacDefault(this, "softwareupdate-auto-install", { domain: "com.apple.SoftwareUpdate", key: "AutomaticallyInstallMacOSUpdates", value: true });

    // Caps Lock → Input Source toggle
    new Command(this, "defaults-capslock-input", {
      run: `defaults write com.apple.symbolichotkeys AppleSymbolicHotKeys -dict-add 61 \
        '<dict><key>enabled</key><true/><key>value</key><dict><key>parameters</key><array><integer>65535</integer><integer>57</integer><integer>8388608</integer></array><key>type</key><string>standard</string></dict></dict>'`,
    });

    // Xcode Command Line Tools
    new Command(this, "xcode-clt", {
      run: "xcode-select --install 2>/dev/null || true",
      check: "xcode-select -p",
    });

    // Set hostname
    new Command(this, "set-hostname", {
      run: `
        sudo scutil --set ComputerName "MacBook-Pro"
        sudo scutil --set HostName "MacBook-Pro"
        sudo scutil --set LocalHostName "MacBook-Pro"
      `,
      check: 'test "$(scutil --get ComputerName)" = "MacBook-Pro"',
    });
  }
}

export default ({ params = {} }: { params?: Params } = {}) => new MacBookPro(params);
