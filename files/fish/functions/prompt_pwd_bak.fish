function prompt_pwd_bak --description "Print the current working directory, shortened to fit the prompt (backup)"
  echo $PWD | sed -e "s|^$HOME|~|"
end
