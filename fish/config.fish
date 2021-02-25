alias curltime='curl -w "@/home/eabrouwer3/tmp/curl-format.txt"'

set -x LD_LIBRARY_PATH /home/eabrouwer3/.mujoco/mjpro150/bin:/home/eabrouwer3/.mujoco/mujoco200/bin
set -x BAT_THEME "base16"

pyenv init - | source
set -x PIPENV_PYTHON $PYENV_ROOT/shims/python

# TaxBit Tunnels
alias dbtunnel='ssh -L 5432:staging-cluster.cluster-coj8zyvaav5h.us-east-1.rds.amazonaws.com:5432 ubuntu@staging-server.taxbit.com -i ~/.ssh/taxbit'
alias assettunnel='ssh -L 8888:buxwwn6cel.execute-api.us-east-1.amazonaws.com:443 ubuntu@staging-server.taxbit.com -i ~/.ssh/taxbit'
alias jup='pipenv run jupyter notebook'
