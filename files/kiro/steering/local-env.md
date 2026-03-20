# Development Rules

MAKE SMALL CHANGES : Don't overengineer things and make broad sweeping changes to how things work. Look for where you can make the smallest code change possible and do that most of the time.

MAINTAIN SIMPLICITY : The code you add shouldn't add undue complexity. It should keep things simple and readable.

REUSE EXISTING CODE : Always check for existing functions to do things that you need to do before writing your own.

KEEP ONLY ACTIVE CODE : Ensure all code is used and necessary when refactoring earlier versions.

CREATE MEANINGFUL TESTS : Ensure tests are focused and not overly verbose.

STUDY THE CODEBASE FIRST : Thoroughly examine existing patterns before contributing. Match the style of the codebase when it comes to variable name conventions, file name conventions, functional/declaritive style, etc.

USE DESCRIPTIVE VARIABLES/FILE NAMES : Make sure the file names and variables you use describe what they do well without being overly long or hard to read.

USE RESTRAINT WHEN ADDING DEPENDENCIES : Dependencies add compile time and complexity and dependencies on downstream code. Only add them when they provide more benefit by having them than the cost and risk.

# Development Environment

We use fish shell. Run `nvm use` once at the start of a shell session before executing any node/npm/npx commands. You don't need to run it before every command - once per session is enough. There should be a `.nvmrc` in the project root so `nvm use` picks up the right version automatically. The `nvm` command is available in every shell session, so you never need to run a `source nvm.sh` command or anything like that. Just run `nvm use`.

```bash
nvm use
```

## "Development Scripts"

There exists the ~/tmp directory where all development scripts and large test data files should go. They should be placed in focused directories with everything needed to run them there.

### Python scripts

All python code in ~/tmp can be run with `uv`

Example:
```bash
uv add ...
uv run my_script.py
```

### Clojure scripts

All clojure code should use `deps.edn` style and be run using `clj`

### Typescript (Deno) scripts

All typescript files/scripts should be runnable via Deno and should use deno-style imports. The files should have a `.deno.ts` suffix to be descriptive.

Example (Script file):
```ts
import { asyncSleep } from "npm:modern-async";
import fs from 'node:fs/promises';
import postgres from "https://deno.land/x/postgresjs/mod.js";
...
```

Example (Running):
```bash
deno script.deno.ts
```
