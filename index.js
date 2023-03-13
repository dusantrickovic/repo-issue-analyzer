const core = require('@actions/core');
const github = require('@actions/github');
const isValidDateFormat = require('./functions/validate-date');
const { fetchData, CURRENT_DATE } = require('./functions/fetch-data');


try {
    let usingCurrentDate = false;

    // Input variables read from test.yml (comment them when testing localy)
    // The GITHUB_TOKEN variable is placed inside functions/fetch-data.js, as it is the only piece of code that's using it.

    // If no (valid) custom date is provided in the configuration's input, use CURRENT_DATE as default.

    let CUSTOM_DATE = core.getInput('custom-date') === '' ? CURRENT_DATE : core.getInput('custom-date');
    const REPO_NAME = core.getInput('repository-name');
    
    // Uncomment for local testing purposes
    
    // CUSTOM_DATE = '2023-03-13';
    // REPO_NAME = 'runner-images';
    
    // Calls the fetching function and deals with the formatting of the output
    async function showAllData(repositoryName, date = undefined) {
        const states = ['all', 'open', 'closed'];
        console.log('--------------------------');
        console.info(`REPOSITORY NAME: actions/${REPO_NAME}`);
        console.log('--------------------------');

        await fetchData(repositoryName, states, date, 'issue');

        console.log('--------------------------');

        await fetchData(repositoryName, states, date, 'PR');

        console.log('--------------------------');
    }

    async function main() {
        const stringWithNotNullDate = `Date provided. Gathering information for 'actions/${REPO_NAME}' since the date provided`
        const stringWithNullDate = `Using current date. Gathering information for 'actions/${REPO_NAME}' in total numbers up to now...`

        if (isValidDateFormat(CUSTOM_DATE) === false || CUSTOM_DATE === CURRENT_DATE) {
            console.log(`Date provided: ${CUSTOM_DATE}`);
            console.log(`Current date: ${CURRENT_DATE}`);
            console.log(`Invalid or current date input.`)
            CUSTOM_DATE = CURRENT_DATE;
            usingCurrentDate = true;
        } 

        if (usingCurrentDate === true) {
            console.log(stringWithNullDate);
        }

        else {
            console.log(`Date provided: ${CUSTOM_DATE}`);
            console.log(`Current date: ${CURRENT_DATE}`);
            console.log(`${stringWithNotNullDate} (${CUSTOM_DATE})`);
        }

        showAllData(REPO_NAME, CUSTOM_DATE);

    };

    main();

} catch (error) {
    core.setFailed(error.message);
}
