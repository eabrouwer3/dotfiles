# Fish Shell Syntax Reference

This environment uses the fish shell. Fish is NOT bash/zsh/POSIX sh. Many common shell patterns are syntactically different or invalid in fish. Always use fish syntax when generating shell commands.

## Variables

```fish
# Setting variables (NO export keyword, NO equals-with-dollar)
set myvar "hello"
set -x MY_ENV_VAR "value"     # exported (like bash `export`)
set -gx MY_ENV_VAR "value"    # global + exported
set -l local_var "value"      # local to current block
set -e MY_VAR                 # erase/unset a variable

# WRONG (bash syntax):
# export FOO="bar"            # ✗ not valid fish
# FOO=bar command             # ✗ not valid fish
# Use instead:
env FOO=bar command            # ✓ for inline env vars with a command
set -lx FOO bar; command       # ✓ alternative

# Variable expansion
echo $myvar
echo $PATH                     # fish splits lists automatically
echo "$myvar"                  # quoted, no word splitting
echo (count $PATH)             # number of elements in list variable
```

## Command Substitution

```fish
# Fish uses parentheses, NOT backticks or $()
set result (echo hello)
set files (ls *.txt)

# WRONG:
# result=$(echo hello)         # ✗ not valid fish
# result=`echo hello`          # ✗ not valid fish
```

## Conditionals

```fish
# if / else if / else / end (NOT fi, NOT closing brackets)
if test -f myfile.txt
    echo "exists"
else if test -d mydir
    echo "is directory"
else
    echo "nope"
end

# String comparison
if test "$var" = "value"
    echo "match"
end

# Numeric comparison
if test $count -gt 5
    echo "big"
end

# Command success
if command -v node >/dev/null
    echo "node is installed"
end

# Negation
if not test -f myfile.txt
    echo "missing"
end

# Combining conditions (no -a or -o, use separate tests)
if test -f foo; and test -f bar
    echo "both exist"
end

if test -f foo; or test -f bar
    echo "at least one exists"
end
```

## Loops

```fish
# for loop (NO do/done keywords)
for file in *.txt
    echo $file
end

for i in (seq 1 10)
    echo $i
end

# while loop
while test $count -lt 10
    set count (math $count + 1)
end

# Iterating over command output
for line in (cat myfile.txt)
    echo "Line: $line"
end

# WRONG (bash syntax):
# for file in *.txt; do echo $file; done    # ✗
# for ((i=0; i<10; i++)); do echo $i; done  # ✗
```

## Functions

```fish
# Define a function
function greet
    echo "Hello, $argv[1]"
end

# With a description
function greet --description "Say hello"
    echo "Hello, $argv[1]"
end

# Arguments are in $argv (NOT $1, $2, etc.)
function example
    echo "First arg: $argv[1]"
    echo "All args: $argv"
    echo "Arg count: "(count $argv)
end

# Return status (NOT return with a value — only status codes 0-255)
function is_even
    test (math "$argv[1] % 2") -eq 0
end
```

## String Operations

```fish
# Use the string builtin (NOT sed/awk for simple ops)
string match -q "*.txt" $filename
string replace "old" "new" $mystring
string split "," $csv_line
string trim $myvar
string length $myvar
string sub -s 1 -l 5 $myvar          # substring
string match -r "pattern" $myvar      # regex match
```

## Math

```fish
# Use math builtin (NOT $(( )) or expr)
set result (math "5 + 3")
set result (math "$x * 2")
set result (math "ceil(3.2)")

# WRONG:
# result=$((5 + 3))           # ✗ not valid fish
# result=$(expr 5 + 3)        # works but not idiomatic
```

## Piping and Redirects

```fish
# Piping works the same
command1 | command2

# Redirects
command > file.txt             # stdout
command 2> errors.txt          # stderr
command &> all.txt             # both stdout and stderr (fish 3.0+)
command 2>&1                   # stderr to stdout

# WRONG:
# command 2>&1 > file          # ✗ order matters differently in fish
```

## Logical Operators

```fish
# Use ; and / ; or (NOT && or ||)
command1; and command2         # run command2 only if command1 succeeds
command1; or command2          # run command2 only if command1 fails

# In fish 3.0+, && and || ARE supported:
command1 && command2
command1 || command2
```

## Lists / Arrays

```fish
# Fish variables are lists by default
set mylist a b c
echo $mylist[1]                # "a" (1-indexed, NOT 0-indexed)
echo $mylist[2..3]             # "b c" (slicing)
set -a mylist d                # append to list
set -p mylist z                # prepend to list
echo (count $mylist)           # length

# PATH is a list
set -gx PATH $HOME/.local/bin $PATH
# WRONG:
# export PATH="$HOME/.local/bin:$PATH"   # ✗ colon-separated doesn't work
```

## Switch / Case

```fish
switch $var
    case "value1"
        echo "matched 1"
    case "value2" "value3"
        echo "matched 2 or 3"
    case '*'
        echo "default"
end
```

## Common Gotchas

1. No `[[` double bracket syntax — use `test` or `[` (single bracket)
2. No `{a,b,c}` brace expansion for commands — use `for` loops or explicit args
3. No process substitution `<(command)` — use `(command | psub)` instead
4. No `source ~/.bashrc` — fish config is at `~/.config/fish/config.fish`
5. No `$?` for last exit status — use `$status`
6. No `!!` for last command — use `$history[1]` or up arrow
7. Semicolons separate commands on one line (same as bash)
8. `test` and `[` work the same as POSIX, but prefer `test` for clarity
9. No heredocs (`<<EOF`) — use `printf` or `echo` with multiple lines, or a temp file. To write multi-line content to a file, use `printf` or write it with a tool (fsWrite), never `cat << 'EOF' > file`
10. No `function() { }` syntax — always use `function name ... end`
11. No `cat << 'SCRIPT' > file.ts` — this is a bash heredoc and will fail in fish with "Expected a string, but found a redirection". Use `printf '%s\n' 'line1' 'line2' > file.ts` or write the file using a tool instead
12. Shell scripts with `#!/bin/sh` shebang use POSIX sh syntax (not fish). When writing `.sh` files (like install scripts), use POSIX syntax (`VAR=value`, `export`, `$()`, `if/then/fi`, etc.). Fish syntax only applies to interactive fish sessions and `.fish` files.
