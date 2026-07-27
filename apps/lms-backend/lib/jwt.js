const jwt = require("jsonwebtoken");

exports.generateToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

exports.generateAccessToken = (payload) => {
  const { username, ...user } = payload;

  return jwt.sign(
    {
      sub: username,
      user,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    },
  );
};

exports.generateRefreshToken = (payload) => {
  const { username, ...user } = payload;

  return jwt.sign(
    {
      sub: username,
      user,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    },
  );
};

exports.verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};