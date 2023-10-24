const { Router } = require("express");
const User = require("../models/user");

const getUsers = Router();

getUsers.get('/', async (req, res) => {
    try {
        const country = req.query.country || 'Bangladesh';
        // Fetch user data from MongoDB
        const users = await User.find({ country: country }).sort({ maxRating: -1, participation: 1 });
        const maxUpdatedAt = await User.aggregate([
            { $match: { country: country } },
            { $group: { _id: null, maxUpdated: { $max: "$updatedAt" } } },
        ]);

        // Extract the maximum updatedAt value or provide a default date
        const updated_at = maxUpdatedAt.length > 0 ? maxUpdatedAt[0].maxUpdated : new Date();
        const date = new Date(updated_at);

        // Format the date
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        // Render the EJS template with user data
        res.render('index', { users, updated_at: formattedDate, country });
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).send('Internal Server Error');
    }
})

module.exports = getUsers;