# Repository Issue/PR Analyzer

A simple JavaScript action that takes a repository name as input (currently, only those whose Owner is Actions) and generates a short report in the console displaying total number of PRs and Issues for that repository, as well as those currently open and closed.

## Try It Out

To try out this action, you can clone the repository using ```git clone <repo-link>``` and modify either of the two input values inside the ```test.yml``` file (repository-name or custom-date). You can then push the changes to the repository and try creating a PR.

***The action is set to trigger whenever a PR is created or the code gets pushed.***

## Important notes:

- The date validation is set to default to ***current date***. This means that, should the date input you provide be invalid or an empty string, the date will default to the current one and will provide info up until then.

- With the current settings, the application is set to only work with **GITHUB ACTIONS** repositories.

- The action (at this time) assumes your input for the repository name is valid.

- The only inputs that need modifying are **custom-date** and **repository-name** inside `.github/workflows/test.yml`. GitHub token is already defined.

- If you'd only like to test the action locally, I have provided some local variables to use instead (just make sure to comment out the ones interacting with `@actions/core` first)!

