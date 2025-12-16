const axios = require('axios');
const constants = require('../lib/constants');
const { sendMail } = require('../config/nodeMailer');
const redisService = require('../services/redisService');
const { GetAccessToken, verifyToken } = require("../lib/helper");
const path = require("path");


exports.getSession = async (req, res) => {
  const jwt = req.session.jwt;
  const { authorization } = req.headers
  const token = authorization ? authorization.split(" ")[0] : "";

  // check valid token
  if ((jwt && jwt.access_token && verifyToken(jwt.access_token)?.valid) || (token && verifyToken(token)?.valid)) {
    if (token) req.session.jwt = { access_token: token };
    req.session.cookie.originalMaxAge += 1000 * 60 * 60 * 3; // Add 3 hours in milliseconds
    return res.status(200).json({ isTokenValid: true, message: "Authenticated successfully!", session: req.session });
  }

  res.json({ isTokenValid: false, error: "Session has been expired." });
};

exports.login = (req, res) => {
  const { redirectURL } = req.query;
  if (!redirectURL) return res.redirect(302, "back");

  // check valid token
  const jwt = req.session?.jwt;
  if (jwt && jwt.access_token) {
    const isTokenValid = verifyToken(jwt?.access_token)?.valid;
    if (isTokenValid) return res.redirect(redirectURL);
  }

  res.render("login");
};

exports.doLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) res.status(400).json({ status: false, message: "Email is required." });
    if (!password) res.status(400).json({ status: false, message: "Password is required." });

    // Check email and password...
    let token;
    let userData;
    try {
      const { data } = await axios.post(`${process.env.USER_MANAGEMENT_URL}/verify`, { email, password });
      userData = data;
      token = GetAccessToken({ username: email, user_id: data.user_id });
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 404) {
        res.status(400).json({ status: false, message: "Email or password is incorrect." });
        return;
      }
    }

    // Set the session
    req.session.jwt = token;
    res.cookie('jwt', token, {
      httpOnly: true,
    });

    return res.json({ status: true, message: "Successfully logged in!", data: { token, user_id: userData.user_id  , email: userData.email ,name: userData.name , role: userData.role } });
  } catch (error) {
    console.log('error: ', error);
    return res.status(401).json({ status: false, message: "Login fail.", data: error });
  }
};

exports.forgot = (req, res) => {
  res.render("forgot", { FRONTEND_URL: process.env.FRONTEND_URL });
};

exports.doForgot = async (req, res) => {
  try {
    const { email } = req.body;

    let redirectURL = `${process.env.SSO_URL}/password/reset`;

    if (req.headers['redirect-url']) {
      redirectURL = req.headers['redirect-url'];
    }

    if (!email) res.status(400).json({ status: false, message: "Email is required." });

    const {data} = await axios.get(`${process.env.USER_MANAGEMENT_URL}/by-email?email=${email}`)
    const user = data;

    if (!user || user?.email !== email) return res.status(401).json({ status: false, message: "Email is incorrect." });

    await redisService.redis('hmset', `${constants.redisKeys.userData}:${user.user_id}`,
      constants.redisKeys.id, user.user_id,
      constants.redisKeys.name, user.name,
      constants.redisKeys.email, user.email,
      // constants.redisKeys.phone, user.phone_number,
      constants.redisKeys.username, user.email,
    );

    await redisService.redis('expire', `${constants.redisKeys.userData}:${user.user_id}`, 300);

    const response = await sendMail(user, `${redirectURL}?uid=${user.user_id}`);
    console.log("mail Sent...", response.messageId);

    return res.json({ status: true, message: "Success !" });
  } catch (error) {
    console.log('error: ', error);
    return res.status(401).json({ status: false, message: "Do forgot failed!." });
  }
};

exports.logout = async (req, res) => {
  console.log("Logout...", req.sessionID);

  req.session.destroy(err => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/")
  });
};

exports.resetPassword = async (req, res) => {
  const { uid } = req.query;
  let userRedisData = await redisService.redis('hgetall', `${constants.redisKeys.userData}:${uid}`); // hgetall  return all data as a object

  if (!userRedisData.id) return res.status(401).json({ status: false, message: "Invalid link." });

  res.render('reset');
};

exports.doResetPassword = async (req, res) => {
  try {
    const { uid } = req.query;
    const { password } = req.body;

    let userRedisData = await redisService.redis('hgetall', `${constants.redisKeys.userData}:${uid}`); // hgetall  return all data as a object

    if (!userRedisData.id) return res.status(401).json({ status: false, message: "Invalid link." });
  
    if (!password) res.status(400).json({ status: false, message: "Password is required." });

    const response = await axios.put(`${process.env.USER_MANAGEMENT_URL}/${uid}/password`, { password });

    if (!response.data) {
      res.status(401).json({ status: false, message: "Reset password failed." });
      return;
    }

    await redisService.redis('del', `${constants.redisKeys.userData}:${uid}`);
    res.json({ status: true, message: "Success !" });
  } catch (error) {
    console.log('error: ', error);
    return res.status(401).json({ status: false, message: "Reset password failed!." });
  }
};

exports.getLogo = (req, res) => {
   const imagePath = path.join(__dirname, "../Public/assets/favicon.svg");
  res.sendFile(imagePath);
}
