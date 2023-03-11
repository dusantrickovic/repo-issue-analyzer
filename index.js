const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

try {
    const dateObject = new Date();
    const CURRENT_DATE = `${dateObject.getFullYear()}-${dateObject.getMonth() + 1}-${dateObject.getDate()}`;

    let CUSTOM_DATE = core.getInput('custom-date') === '' ? CURRENT_DATE : core.getInput('custom-date');
    const REPO_NAME = core.getInput('repository-name');
    const GITHUB_TOKEN = core.getInput('repo-token');

    async function fetchData(repositoryName, states = [], date = null, type='issue') {
        try {
            const API_ENDPOINT_URL = 'https://api.github.com/search/issues';
            const query = `q=repo:actions/${repositoryName}+type:${type.toLowerCase()}`
            const urlWithRepoName = `${API_ENDPOINT_URL}?${query}`

            for(let i = 0; i < states.length; i++) {
                
                if (date !== null && date !== CURRENT_DATE) {
                    const urlWithQueryWithDate = `${urlWithRepoName}+created:>${date}`
                    await axios({
                        method: 'get',
                        url: `${urlWithQueryWithDate}${states[i] === 'all' ? '&state:all' : `+state:${states[i]}`}`,
                        headers: {
                            authentication: `token ${GITHUB_TOKEN}`
                        }
                    })
                    .then(({data}) => {
                        console.log(`Number of ${states[i]} ${type}s after ${date}: ${data.total_count}`);
                    });
                    continue;
                }

                await axios({
                    method: 'get',
                    url: `${urlWithRepoName}${states[i] === 'all' ? '&state:all' : ` state:${states[i]}`}`,
                    headers: {
                        authentication: `token ${GITHUB_TOKEN}`
                    }
                })
                .then(({data}) => {
                    console.log(`Total number of ${states[i]} ${type}s: ${data.total_count}`);
                });
                continue;
            }

        } catch (error) {
            console.error(error);
            throw new Error('Error fetching data');
        }
    }
    
    
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
