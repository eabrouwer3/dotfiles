# Implementation Plan: zx-dotfiles

## Overview

Build a single `setup.mjs` zx script that replaces the dacha framework. The script is built incrementally: project scaffolding → data declarations → helper functions → apply functions → watch/sync modes → launchd agents → main entrypoint → tests → git branch. Each task produces working, testable code that builds on the previous step.

## Tasks

- [x] 1. Create project scaffolding
  - [x] 1.1 Create `package.json` with zx dependency and `"setup"` script (`zx setup.mjs`)
    - _Requirements: 1.2_
  - [x] 1.2 Create `.nvmrc` specifying the Node.js version
    - _Requirements: 1.3_
  - [x] 1.3 Create initial `setup.mjs` with shebang, zx imports, and a placeholder main function that prints "setup.mjs loaded"
    - Import `fs`, `path`, `os`, `crypto` from Node builtins
    - Set `cd()` to repo root using `import.meta.dirname` so paths work regardless of caller's working directory
    - _Requirements: 1.1, 1.4_

- [x] 2. Implement data declarations in `setup.mjs`
  - [x] 2.1 Add the `packages` array (27 brew package names)
    - _Requirements: 4.3_
  - [x] 2.2 Add the `casks` array (28 cask names)
    - _Requirements: 5.3_
  - [x] 2.3 Add the `directories` function (returns array of paths, conditional on `isTaxbitLaptop`)
    - _Requirements: 6.1, 6.2_
  - [x] 2.4 Add the `gitRepos` array (3 repos with `repo` and `dest` fields)
    - _Requirements: 7.3_
  - [x] 2.5 Add the `files` array (12 file mappings with `src` and `dest` fields)
    - _Requirements: 8.5_
  - [x] 2.6 Add the `secrets` array (3 secrets with `src` and `dest` fields)
    - _Requirements: 9.5_
  - [x] 2.7 Add the `commands` array (fisher-bootstrap and krew-plugins with `id`, `run`, `check`)
    - _Requirements: 10.1, 10.3_
  - [x] 2.8 Add the `defaults` array (all macOS defaults with `domain`, `key`, `value`)
    - _Requirements: 11.3_

- [x] 3. Implement helper functions in `setup.mjs`
  - [x] 3.1 Implement `resolveHome(p)` — expands `~/` to `os.homedir()`
    - _Requirements: 1.4_
  - [x] 3.2 Implement `fileHash(filepath)` — returns SHA-256 hex digest or null if file missing, using Node `crypto.createHash`
    - _Requirements: 8.1, 8.2_
  - [x] 3.3 Implement `ensureBrew()` — checks `which brew`, installs Homebrew if missing
    - _Requirements: 2.1, 2.3_
  - [x] 3.4 Implement `ensureAge()` — checks `which age`, runs `brew install age` if missing
    - _Requirements: 2.2, 2.4_
  - [x] 3.5 Implement `loadParams(lockfilePath)` — reads lockfile or prompts via `question()`, writes lockfile, returns params object
    - Lockfile schema: `{ version: 1, createdAt, params: { isTaxbitLaptop } }`
    - Write-to-temp-then-rename for atomic writes
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 3.6 Implement `defaultsTypeFlag(value)` and `normalizeDefaultsRead(raw, desired)` for macOS defaults type mapping
    - _Requirements: 11.1, 11.2_

- [x] 4. Checkpoint - Ensure scaffolding and helpers are solid
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement apply functions in `setup.mjs`
  - [x] 5.1 Implement `applyPackages(packages)` — `brew list` to check, `brew install` to apply
    - Each apply function returns `{ applied, skipped, failed }` arrays
    - Log with status icons: ✓ skip, ✚ apply, ✗ fail
    - _Requirements: 4.1, 4.2, 12.1, 12.2, 12.4_
  - [x] 5.2 Implement `applyCasks(casks)` — `brew list --cask` to check, `brew install --cask` to apply
    - _Requirements: 5.1, 5.2, 12.1, 12.2_
  - [x] 5.3 Implement `applyDirectories(dirs)` — `fs.stat` to check, `fs.mkdir` recursive to apply
    - _Requirements: 6.1, 6.2, 6.3, 12.1, 12.2_
  - [x] 5.4 Implement `applyGitRepos(repos)` — check `.git` dir exists, `git clone` to apply
    - _Requirements: 7.1, 7.2, 7.4, 12.1, 12.2_
  - [x] 5.5 Implement `applyFiles(files)` — SHA-256 hash comparison for files, stat check for dirs, `fs.cp` to apply, create parent dirs
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 12.1, 12.2_
  - [x] 5.6 Implement `applySecrets(secrets)` — `fs.stat` dest to check, `age -d -i ~/.ssh/id_rsa` to decrypt, write with `0600` permissions, create parent dirs
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 12.1, 12.2_
  - [x] 5.7 Implement `applyCommands(commands)` — run `check` command (exit 0 = skip), run `run` command to apply
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 12.1, 12.2_
  - [x] 5.8 Implement `applyDefaults(defaults)` — `defaults read` + normalize to check, `defaults write` to apply
    - _Requirements: 11.1, 11.2, 11.3, 12.1, 12.2_
  - [x] 5.9 Implement `applyHostname()` — `scutil --get ComputerName` to check, `scutil --set` to apply
    - _Requirements: 11.5, 12.1, 12.2_
  - [x] 5.10 Implement `printSummary(results)` — aggregates all apply results and prints totals
    - _Requirements: 12.4_

- [x] 6. Checkpoint - Ensure apply functions are complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement watch and sync modes in `setup.mjs`
  - [x] 7.1 Implement `watchRepoToMachine(files)` — uses `fs.watch("files/", { recursive: true })`, debounces 2s per file, copies changed file to destination
    - _Requirements: 13.1, 13.2, 13.3_
  - [x] 7.2 Implement `syncMachineToRepo(files)` — watches destination paths, debounces 2s, copies dest→source, git add/commit/push, retry on push failure every 60s
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 8. Implement launchd agent installation in `setup.mjs`
  - [x] 8.1 Implement `installLaunchdAgents(repoDir)` — generates two plist files for watch and sync modes, compares with existing, writes if different, runs `launchctl unload` then `launchctl load`
    - Plist paths: `~/Library/LaunchAgents/dev.dotfiles.watch.plist` and `~/Library/LaunchAgents/dev.dotfiles.sync.plist`
    - KeepAlive: true, logs to `~/Library/Logs/dotfiles-watch.log` and `~/Library/Logs/dotfiles-sync.log`
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [x] 9. Implement main entrypoint and wire everything together
  - [x] 9.1 Implement the main function that parses `argv` and dispatches to apply pipeline, `watch`, or `sync` mode
    - Apply pipeline calls in order: ensurePrereqs → loadParams → applyPackages → applyCasks → applyDirectories → applyGitRepos → applyFiles → applySecrets → applyCommands → applyDefaults → applyHostname → installLaunchdAgents → printSummary
    - _Requirements: 1.1, 1.4, 12.3, 12.4_

- [x] 10. Checkpoint - Ensure full script works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Write tests
  - [ ]* 11.1 Create test file with unit tests for data completeness
    - Verify `packages` array has exactly 27 entries with expected names
    - Verify `casks` array has exactly 28 entries with expected names
    - Verify `files` array has exactly 12 mappings
    - Verify `secrets` array has exactly 3 entries
    - Verify `gitRepos` array has exactly 3 entries
    - _Requirements: 4.3, 5.3, 7.3, 8.5, 9.5_
  - [ ]* 11.2 Write property test: `resolveHome` path expansion
    - **Property 1: Path resolution with home expansion**
    - **Validates: Requirements 1.4**
  - [ ]* 11.3 Write property test: lockfile round trip
    - **Property 2: Lockfile round trip**
    - **Validates: Requirements 3.1, 3.2, 3.3**
  - [ ]* 11.4 Write property test: `fileHash` determinism
    - **Property 3: File hash determinism and equality**
    - **Validates: Requirements 8.1, 8.2**
  - [ ]* 11.5 Write property test: macOS defaults type inference
    - **Property 4: macOS defaults type inference**
    - **Validates: Requirements 11.1, 11.2**
  - [ ]* 11.6 Write property test: debounce coalescing
    - **Property 5: Debounce coalesces rapid events**
    - **Validates: Requirements 13.3, 14.4**
  - [ ]* 11.7 Write property test: summary aggregation
    - **Property 6: Summary aggregation**
    - **Validates: Requirements 12.4**
  - [ ]* 11.8 Write unit tests for conditional directory creation
    - Verify `directories(params)` includes `~/source/taxbit` when `isTaxbitLaptop` is true and excludes it when false
    - _Requirements: 3.4, 6.2_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Create `zx` branch and commit all files
  - [x] 13.1 Create the `zx` branch from current HEAD, add `package.json`, `.nvmrc`, `setup.mjs`, test files, and commit
    - Do not modify `dacha.config.ts` or `deno.json`
    - _Requirements: 16.1, 16.2_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The script is a single `setup.mjs` file — tasks build it up incrementally section by section
- All shell commands in the script use zx's `$` tagged template literal
