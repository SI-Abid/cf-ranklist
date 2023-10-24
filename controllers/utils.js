const User = require("../models/user");
const axios = require("axios");
const { load } = require("cheerio");
const { promisify } = require('util');

const delay = promisify(setTimeout);

const fetchAndSaveData = async (page, country) => {
    const url = `https://codeforces.com/ratings/country/${country}/page/${page}`;
    const endpoint = 'https://codeforces.com/api/user.info?handles=';

    try {
        const res = await axios.get(url);
        const html = res.data;
        const $ = load(html);

        const datatable = $(".datatable.ratingsDatatable");
        const table = datatable.find("table");

        const userData = [];

        table.find("tr").each((idx, element) => {
            if (idx === 0) return;
            const row = $(element);
            const cells = row.find("td");
            const handle = $(cells[1]).text().trim();
            const nop = $(cells[2]).text().trim();
            const profileUrl = "https://codeforces.com/profile/" + handle;
            userData.push({ handle, maxRating: 0, participation: nop, profileUrl });
        });

        const handles = userData.map(user => user.handle);
        // const query = handles.join(';');

        const cfResponse = await axios.get(endpoint + handles.join(';'));
        const userInfos = cfResponse.data.result;
        for (let i = 0; i < userInfos.length; i++) {
            userData[i].maxRating = userInfos[i].maxRating;
            userData[i].country = userInfos[i].country;
            userData[i].registered = getAge(userInfos[i].registrationTimeSeconds);
        }

        // Update the sorted user data into the database
        const query = { handle: userData.handle };

        // Define the update that should be applied
        const update = {
            $set: { maxRating: userData.maxRating, participation: userData.participation },
            // You can add more fields to update as needed
        };

        // Use the updateOne method to either update the existing user or insert a new one
        await User.updateOne(query, update, { upsert: true });
        console.log(`Page ${page} data saved.`);
    } catch (error) {
        console.error(`Error fetching and saving data for page ${page}:`);
    }
}

const getAge = (timeSince) => {

    // Convert Unix timestamp to milliseconds
    const targetDate = new Date(timeSince * 1000);

    // Get the current date (today)
    const currentDate = new Date();

    // Calculate the time difference in milliseconds
    const timeDifference = currentDate - targetDate;

    // Define constants for milliseconds per day, month, and year
    const msPerDay = 24 * 60 * 60 * 1000;
    const msPerMonth = msPerDay * 30.44; // Average number of days per month
    const msPerYear = msPerMonth * 12;

    // Calculate the rounded time difference in days, months, and years
    const roundedDays = Math.round(timeDifference / msPerDay);
    const roundedMonths = Math.round(timeDifference / msPerMonth);
    const roundedYears = Math.round(timeDifference / msPerYear);

    if (roundedDays <= 30) return `${roundedDays} days ago`;
    if (roundedMonths <= 12) return `${roundedMonths} months ago`;
    return `${roundedYears} years ago`;
}


const refreshUserDatabase = async (country = 'Bangladesh') => {
    const startPage = 1;
    const endPage = 70;
    await User.deleteMany({ country });
    for (let page = startPage; page <= endPage; page++) {
        await fetchAndSaveData(page, country);
        await delay(5000); // Delay for 5 seconds
    }
    console.log("All data fetched and saved.");
};


module.exports = { refreshUserDatabase };