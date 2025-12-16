require("dotenv").config();
const jwt = require('jsonwebtoken');

function GetAccessToken(payload) {
    const { username, ...user } = payload;
    const access_token = jwt.sign({ sub: username, user }, process.env.JWT_ACCESS_SECRET, {});
    const refresh_token = GenerateRefreshToken(username);

    return { access_token, refresh_token };
}

function GenerateRefreshToken(payload) {
    const { username, ...user } = payload;
    const refresh_token = jwt.sign({ sub: username, user }, process.env.JWT_REFRESH_SECRET, {});

    return refresh_token;
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        return { valid: true, data: decoded };
    } catch (err) {
        console.log(err.message);
        return { valid: false, data: {} };
    }
}

async function verifyRefreshToken(token) {
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) return { valid: false, data: {} };
        return { valid: true, data: decoded };
    });
}

module.exports = {
    GetAccessToken,
    GenerateRefreshToken,
    verifyToken,
    verifyRefreshToken
}