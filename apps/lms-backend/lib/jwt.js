var jwt = require('jsonwebtoken');

exports.generateToken = async (data) => {
    return jwt.sign(data, process.env.JWT_SECRET);
}

exports.verifyToken = async (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}