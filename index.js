const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

const API_ENDPOINT_URL = 'https://api.github.com/search/issues';

try {
    const REPO_NAME = core.getInput('repository-name');
    const CUSTOM_DATE = core.getInput('custom-date');
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
    if (!CUSTOM_DATE) {
        CUSTOM_DATE = new Date().toTimeString();
    }

    async function fetchIssues(repositoryName, state = 'all', date = null) {
        try {
            const query = `q=repo:actions/${repositoryName}+type:issue`
            const urlWithRepoName = `${API_ENDPOINT_URL}?${query}`

            if (date !== null) {
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
    
    async function showTotalIssues(repositoryName, date = null) {
        await fetchIssues(repositoryName, 'all', date);
        await fetchIssues(repositoryName, 'open', date);
        await fetchIssues(repositoryName, 'closed', date);
    }

    // const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout,
    // });

    async function main() {

        console.log('Displaying issue information based on your input...');
        showTotalIssues(REPO_NAME, CUSTOM_DATE);

        // rl.question('Do you want to see the issues generated on a custom date? (yes/no) ', (answer) => {
        //         if (answer.toLowerCase() === 'yes') {
        //             rl.question('Please input a date [YYYY-MM-DD]: ', (date) => {
        //             console.log(`You entered the date: ${date}. Showing the numbers...`);
        //             showTotalIssues(REPO_NAME, date)
        //             rl.close();
        //         });
        //         } else {
        //             console.log('Okay, showing total numbers instead...');
        //             showTotalIssues(REPO_NAME, null);
        //             rl.close();
        //         }
        //     });
    };

    main();

} catch (error) {
    core.setFailed(error.message);
}
