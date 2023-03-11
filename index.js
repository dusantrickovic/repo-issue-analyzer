const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

const API_ENDPOINT_URL = 'https://api.github.com/search/issues';

try {
    const dateObject = new Date();
    const CURRENT_DATE = `${dateObject.getFullYear()}-${dateObject.getMonth() + 1}-${dateObject.getDate()}`;
    let CUSTOM_DATE = core.getInput('custom-date') === '' ? CURRENT_DATE : core.getInput('custom-date');
    const REPO_NAME = core.getInput('repository-name');
    const GITHUB_TOKEN = core.getInput('repo-token');

    async function fetchIssues(repositoryName, state = 'all', date = null) {
        try {
            const query = `q=repo:actions/${repositoryName}+type:issue`
            const urlWithRepoName = `${API_ENDPOINT_URL}?${query}`

            if (date !== null && date !== CURRENT_DATE) {
                const urlWithQueryWithDate = `${urlWithRepoName}+created:>${date}`
                const { data } = await axios({
                    method: 'get',
                    url: `${urlWithQueryWithDate}${state === 'all' ? '&state:all' : `+state:${state}`}`,
                    headers: {
                        authentication: `token ${GITHUB_TOKEN}`
                    }
                });
                console.log(`Number of ${state} issues after ${date}: ${data.total_count}`);
                return data.total_count;
            }

            const { data } = await axios({
                method: 'get',
                url: `${urlWithRepoName}${state === 'all' ? '&state:all' : ` state:${state}`}`,
                headers: {
                    authentication: `token ${GITHUB_TOKEN}`
                }
            });
            console.log(`Number of ${state} issues: ${data.total_count}`);
            return data.total_count;
        } catch (error) {
            console.error(error);
            throw new Error('Error fetching data');
        }
    }
    
    async function showTotalIssues(repositoryName, date = undefined) {
        await fetchIssues(repositoryName, 'all', date);
        await fetchIssues(repositoryName, 'open', date);
        await fetchIssues(repositoryName, 'closed', date);
    }

    async function main() {
        const stringWithNotNullDate = 'Date provided. Gathering Issue information since the date provided'
        const stringWithNullDate = 'Date not provided. Gathering Issue information in total numbers up to now...'

        if (CUSTOM_DATE === '' || CUSTOM_DATE === CURRENT_DATE) {
            console.log(stringWithNullDate);
        }
        else {
            console.log(`${stringWithNotNullDate} (${CUSTOM_DATE})`);
        }

        showTotalIssues(REPO_NAME, CUSTOM_DATE);

    };

    main();

} catch (error) {
    core.setFailed(error.message);
}
