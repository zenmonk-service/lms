const jwt = require('jsonwebtoken');
const { verifyToken } = require('../lib/helper');

async function checkValidToken(req, res, next) {
    const { authorization } = req.headers
    const token = authorization ? authorization.split(" ")[0] : "";
    console.log('token: ', token);
    if (!token || !verifyToken(token)?.valid ) {
        return res.status(401).json({ status: false, message: "Unauthorized" });
    }
    // const isTokenValid = verifyToken(token);
    // if (!isTokenValid?.valid) {
    //     return res.status(401).json({ status: false, message: "Unauthorized" });
    // }
    next();
}

module.exports = {
    checkValidToken
}