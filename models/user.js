const { Schema, model } = require("mongoose");

const userSchema = Schema({
    handle: {
        type: String,
        unique: true,
    },
    maxRating: Number,
    participation: Number,
    profileUrl: String,
    registered: String,
    country: String,
}, { timestamps: true });

const User = model('User', userSchema);

module.exports = User;