const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

try {
    const dateObject = new Date();
    const CURRENT_DATE = `${dateObject.getFullYear()}-${dateObject.getMonth() + 1}-${dateObject.getDate()}`;

    // Input variables read from test.yml
    // If no custom date is provided in the configuration's input, use CURRENT_DATE as default.
    
    // let CUSTOM_DATE = core.getInput('custom-date') === '' ? CURRENT_DATE : core.getInput('custom-date');
    // const REPO_NAME = core.getInput('repository-name');
    // const GITHUB_TOKEN = core.getInput('repo-token');

    let CUSTOM_DATE = '2023-02-20';
    const REPO_NAME = 'checkout';
    const GITHUB_TOKEN = process.env.GITHUB_ACCESS_KEY;

    function isValidDateFormat(date) {
        // Use a regular expression to match the date format
        const dateFormatString = /^\d{4}-\d{2}-\d{2}$/;
        const currentYear = dateObject.getFullYear();
      
        // If the date string matches the regular expression, check if the month and day values are valid
        if (dateFormatString.test(date)) {
          const year = parseInt(date.slice(0, 4));
          const month = parseInt(date.slice(5, 7));
          const day = parseInt(date.slice(8, 10));
      
          if (month <= 12 && day <= 31 && year <= currentYear) {
            return true;
          }
        }
      
        // If the date string is invalid or the month and day values are invalid, return false
        return false;
      }
      

    async function fetchData(repositoryName, states = [], date = null, type='issue') {
        try {
            // Base URL
            const API_ENDPOINT_URL = 'https://api.github.com/search/issues';

            // Additional query that searches for the specific repo and for a specific type (issue or PR)
            const QUERY = `q=repo:actions/${repositoryName}+type:${type.toLowerCase()}`
            const urlWithRepoName = `${API_ENDPOINT_URL}?${QUERY}`

            // A for loop that goes through the uniform logic for each of the three possible states
            for(const state of states) {
                
                if (date !== null && date !== CURRENT_DATE) {
                    const urlWithQueryWithDate = `${urlWithRepoName}+created:>${date}`
                    await axios({
                        method: 'get',
                        url: `${urlWithQueryWithDate}${state === 'all' ? '&state:all' : `+state:${state}`}`,
                        headers: {
                            authentication: `token ${GITHUB_TOKEN}`
                        }
                    })
                    .then(({data}) => {
                        console.log(`Number of ${state} ${type}s after ${date}: ${data.total_count}`);
                    });
                    continue;
                }

                await axios({
                    method: 'get',
                    url: `${urlWithRepoName}${state === 'all' ? '&state:all' : ` state:${state}`}`,
                    headers: {
                        authentication: `token ${GITHUB_TOKEN}`
                    }
                })
                .then(({data}) => {
                    console.log(`Total number of ${state} ${type}s: ${data.total_count}`);
                });
                continue;
            }

        } catch (error) {
            console.error(error);
            throw new Error('Error fetching data');
        }
    }
    
    // Calls the fetching function and deals with the formatting of the output
    async function showAllData(repositoryName, date = undefined) {
        console.log('--------------------------');
        console.info(`REPOSITORY NAME: actions/${REPO_NAME}`);
        console.log('--------------------------');

        await fetchData(repositoryName, ['all', 'open', 'closed'], date, 'issue');

        console.log('--------------------------');

        await fetchData(repositoryName, ['all', 'open', 'closed'], date, 'PR');

        console.log('--------------------------');
    }

    async function main() {

        // Checks the validity of the date input. If invalid, set to CURRENT_DATE
        if (isValidDateFormat(CUSTOM_DATE) === false) {
            console.error('Invalid date format. Switching to default current date...');
            CUSTOM_DATE = CURRENT_DATE;
        }

        const stringWithNotNullDate = `Date provided. Gathering information for 'actions/${REPO_NAME}' since the date provided`
        const stringWithNullDate = `Date not provided. Gathering information for 'actions/${REPO_NAME}' in total numbers up to now...`

        if (CUSTOM_DATE === '' || CUSTOM_DATE === CURRENT_DATE) {
            console.log(stringWithNullDate);
        }
        else {
            console.log(`${stringWithNotNullDate} (${CUSTOM_DATE})`);
        }

        showAllData(REPO_NAME, CUSTOM_DATE);

    };

    main();

} catch (error) {
    core.setFailed(error.message);
}
