
How to get started with the fork of Freon4-dsl

To update a forked repository on GitHub, you need to fetch the changes from the original repository (upstream) and merge them into your fork. Here are the steps:

Open Terminal on your Mac.
Navigate to your local repository (the forked one).
Add the original repository as a remote repository:

> git remote add upstream https://github.com/freon4dsl/Freon4dsl.git

Fetch the branches and their commits from the upstream repository:
> git fetch upstream

Check out your fork's local default branch - usually main:

> git checkout development


Merge the changes from the upstream/main into your local main branch:

> git merge upstream/development


Push your updates to the forked repository on GitHub:

> git push origin development

