function fish_greeting
  fortune | cowsay | lolcat
  if [ "$TERM" != "screen" ]; or [ -z $TMUX ]
    tmux a
    if [ $status -ne 0 ]
      tmux
    end
  end
end
