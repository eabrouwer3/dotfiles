function fish_greeting
  fortune | cowsay | lolcat
  if test "$TERM" != "screen"; and test -z $TMUX; and test "$TERMINAL_EMULATOR" != "JetBrains-JediTerm"; and test "$TERM_PROGRAM" != "vscode"; and test "$TERM_PROGRAM" != "kiro"
    tmux a
    if test $status -ne 0
      tmux
    end
  end
end
