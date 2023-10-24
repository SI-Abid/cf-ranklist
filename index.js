const { config } = require("dotenv");
const { connect } = require("mongoose");
const User = require("./models/user");
const express = require('express');
const path = require("path");
const { refreshUserDatabase } = require("./controllers/utils");
const getUsers = require("./routes/getUsers");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const xssClean = require('xss-clean');
const apis = require("./routes/apis");

config();
const URI = process.env.MONGO_URI;


const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to database!!!');
    // refreshUserDatabase();
});


const rateLimiter = rateLimit({
    windowMs: 15 * 1000, // 15 sec
    max: 5,
    message: 'Too many request from this IP. Try again later.'
});

// middlewares
app.use(rateLimiter);
app.use(xssClean());
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.set('trust proxy', true);
app.use(express.static(__dirname + '/public'));

// routes
app.use('/', getUsers);
app.use('/api', apis);

app.listen(PORT, () => {
    // refresh database every week
    // refreshUserDatabase();
    // setInterval(refreshUserDatabase,  60 * 1000);
    console.log(`Server is running on port http://localhost:${PORT}`);
});