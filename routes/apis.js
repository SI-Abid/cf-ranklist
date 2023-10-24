const { Router } = require("express");
const refreshUsers = require("../controllers/refreshUsers");
const { join } = require("path");

const apis = Router();

apis.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/doc.html'));
})

apis.get('/refresh', refreshUsers)

module.exports = apis;