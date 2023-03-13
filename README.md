# Repository Issue/PR Analyzer

A simple JavaScript action that takes a repository name as input (currently, only those whose Owner is Actions) and generates a short report in the console displaying total number of PRs and Issues for that repository, as well as those currently open and closed.

If the custom date input (format: YYYY-MM-DD) is provided, it generates a report for the numbers starting from that date. If the custom date input is empty or invalid, the validation inside the code sets it to a default value of current date. 

## Try It Out

To try out this action, you can clone the repository using ```git clone <repo-link>``` and modify either of the two input values inside the ```test.yml``` file (repository-name or custom-date). You can then push the changes to the repository and try creating a PR.

The action is set to trigger whenever a PR is created or the code gets pushed.


## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update values inside the YML configuration as appropriate.
