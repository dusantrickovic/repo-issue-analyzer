const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');
require('dotenv').config();

try {
    const dateObject = new Date();

    // Add this logic for two-digit days and months. This will add a 0 to the start when needed and, just in case, slice the last 2 characters
    const dateObjectMonth = (dateObject.getMonth() + 1).toString().padStart(2, '0').slice(-2);
    const dateObjectDay = dateObject.getDate().toString().padStart(2, '0').slice(-2);
    
    const CURRENT_DATE = `${dateObject.getFullYear()}-${dateObjectMonth}-${dateObjectDay}`;
    let usingCurrentDate = false;

    // Input variables read from test.yml
    // If no (valid) custom date is provided in the configuration's input, use CURRENT_DATE as default.

    let CUSTOM_DATE = core.getInput('custom-date') === '' ? CURRENT_DATE : core.getInput('custom-date');
    const REPO_NAME = core.getInput('repository-name');
    const GITHUB_TOKEN = core.getInput('repo-token');
    
    // Uncomment for local testing purposes
    
    // CUSTOM_DATE = '2023-03-13';
    // REPO_NAME = 'runner-images';
    // GITHUB_TOKEN = process.env.GITHUB_ACCESS_KEY;
    
    if (isValidDateFormat(CUSTOM_DATE) === false || CUSTOM_DATE === CURRENT_DATE) {
        console.log(`Date provided: ${CUSTOM_DATE}`);
        console.log(`Current date: ${CURRENT_DATE}`);
        console.log(`Invalid or current date input. Using current date...`)
        CUSTOM_DATE = CURRENT_DATE;
        usingCurrentDate = true;
    }

    function isValidDateFormat(date) {
        // Use a regular expression to match the date format
        const dateFormatString = /^\d{4}-\d{2}-\d{2}$/;
        // Find current date
        const currentDay = dateObject.getDate();
        const currentMonth = dateObject.getMonth() + 1;  // Begins counting from 0
        const currentYear = dateObject.getFullYear();
      
        // If the date string matches the regular expression, check if the month and day values are valid
        if (dateFormatString.test(date)) {
          const year = parseInt(date.slice(0, 4));
          const month = parseInt(date.slice(5, 7));
          const day = parseInt(date.slice(8, 10));
          const inputDate = new Date(`${year}-${month}-${day}`)
          // There's no month past December and no day past 31st and no search can look into the future

          if (month <= 12 && day <= 31) {
            if (year < currentYear || (year === currentYear && month < currentMonth) || 
                (year === currentYear && month === month && day <= currentDay)) {
                    return true;
            }
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
            const repositoryNameParameter = `q=repo:actions/${repositoryName}`;
            const typeParameter = `type:${type.toLocaleLowerCase()}`;
            const dateString = `+created:>${date}`;
            const dateParameter = `${(date === null || date === CURRENT_DATE) ? '' : dateString}`;
            const QUERY = `${repositoryNameParameter}+${typeParameter}`
            const url = `${API_ENDPOINT_URL}?${QUERY}`


            // A for loop that goes through the uniform logic for each of the three possible states
            for(const state of states) {
                await axios({
                    method: 'get',
                    url: `${url}+${dateParameter}${state === 'all' ? '&state:all' : `+state:${state}`}`,
                    headers: {
                        authentication: `token ${GITHUB_TOKEN}`
                    }
                })
                .then(({data}) => {
                    console.log(`Number of ${state} ${type}s ${(date === null || date === CURRENT_DATE) ? '' : `after ${date}`}: ${data.total_count}`);
                });
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

        const stringWithNotNullDate = `Date provided. Gathering information for 'actions/${REPO_NAME}' since the date provided`
        const stringWithNullDate = `Using current date. Gathering information for 'actions/${REPO_NAME}' in total numbers up to now...`

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
