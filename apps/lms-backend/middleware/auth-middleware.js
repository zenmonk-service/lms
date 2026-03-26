const { verifyToken } = require("../lib/jwt");
const { userRepository } = require("../repositories/user-repository");
const { UnauthorizedError } = require("./error");


exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (token) {
       const decoded = await verifyToken(token);
      req.user = await userRepository.getUserById(decoded.user_id);
      if(!req.user.is_active) {
        throw new Error('User is in active')
      }
    }
    next();

    next();
  } catch (err) {
    next(new UnauthorizedError(err.message));
  }
};
