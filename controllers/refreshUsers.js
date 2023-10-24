const { refreshUserDatabase } = require("./utils");

const refreshUsers = async (req, res) => {
    const key = req.headers['key'];
    const country = req.query.country;
    const server_key = process.env.SERVER_KEY;
    const pageLimit = req.query.page || 70;
    if (key !== server_key) {
        return res.status(400).json({
            message: 'Invalid api key provided'
        })
    }
    if (!country) {
        return res.status(400).json({
            message: 'Please provide country name in query'
        })
    }
    refreshUserDatabase(pageLimit, country);
    res.status(202).json({
        message: `All users data of ${country} is being refreshed`
    })
}

module.exports = refreshUsers;