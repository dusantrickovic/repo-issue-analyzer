const core = require('@actions/core');
const axios = require('axios');
require('dotenv').config({path: 'functions/.env' });

const dateObject = new Date();

// Add this logic for two-digit days and months. This will add a 0 to the start when needed and, just in case, slice the last 2 characters
const dateObjectMonth = (dateObject.getMonth() + 1).toString().padStart(2, '0').slice(-2);
const dateObjectDay = dateObject.getDate().toString().padStart(2, '0').slice(-2);
    
const CURRENT_DATE = `${dateObject.getFullYear()}-${dateObjectMonth}-${dateObjectDay}`;

const GITHUB_TOKEN = core.getInput('repo-token')

// Uncomment the line below for local testing purposes
// GITHUB_TOKEN = process.env.GITHUB_ACCESS_KEY;

async function fetchData(repositoryName, states = [], date = null, type='issue') {
    try {
        // Base URL
        const API_ENDPOINT_URL = 'https://api.github.com/search/issues';

        // Additional query that searches for the specific repo and for a specific type (issue or PR)
        const repositoryNameParameter = `q=repo:actions/${repositoryName}`;
        const typeParameter = `type:${type.toLocaleLowerCase()}`;
        const dateString = `+created:>${date}`;
        const dateParameter = `${(date === null || date === CURRENT_DATE) ? '' : dateString}`;
        const QUERY = `${repositoryNameParameter}+${typeParameter}`;
        const url = `${API_ENDPOINT_URL}?${QUERY}`;


        // A for loop that goes through the uniform logic for each of the three possible states
        for(const state of states) {
            await axios({
                method: 'get',
                url: `${url}+${dateParameter}${state === 'all' ? '&state:all' : `+state:${state}`}`,
                headers: {
                    Authentication: `token ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github+json'
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

module.exports = { fetchData, CURRENT_DATE };