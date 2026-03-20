alias curltime 'curl -w "@$HOME/.curl-format.txt" -o /dev/null -s'
alias tf terraform
alias uuid 'uuidgen | string lower'
alias k kubectl
alias nocolor "sed -r 's/\\x1B\\[([0-9]{1,2}(;[0-9]{1,2})?)?[mGK]//g'"
alias awslocal 'AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_DEFAULT_REGION=us-east-1 aws --endpoint-url=http://localhost:4566'
