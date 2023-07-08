function fish_greeting
  fortune | cowsay | lolcat
  if test "$TERM" != "screen"; and test -z $TMUX; and test -z "$INTELLIJ_ENVIRONMENT_READER"
    tmux a
    if test $status -ne 0
      tmux
    end
  end
end
