function gu
    set cur (git branch --show-current | string trim --)
    git fetch --all --prune
    for branch_line in (git branch)
        set branch (string trim -- $branch_line)
        if git ls-remote --exit-code --heads origin $branch > /dev/null
            git checkout $branch -q
            if test (git rev-list --count --left-right HEAD...@{upstream}) = ""
                echo "Fast Forwarding... " $branch
                git pull --rebase --autostash -q
            else
                echo "Up to Date...      " $branch
            end
        end
    end
    git checkout $cur -q
    echo "Done!"
end
