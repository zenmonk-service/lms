const { verifyToken } = require("../lib/jwt");
// const redisService = require("../lib/redis-services");
const { userRepository } = require("../repositories/user-repository");
const { UnauthorizedError } = require("./error");
// const Redis = require("ioredis");
// const redis = new Redis();

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    // if (!token) {
    //     return next(new UnauthorizedError("Token is required."));
    // }
    if (token) {
      const decoded = await verifyToken(token);
      // const user = await redisService.redis('hgetall', decoded.user_id);
      const user = null;
      if (user) {
        res.user = user;
      } else {
        req.user = await userRepository.getUserById(decoded.user_id);
        // await redisServices.add({key:  decoded.user_id, value: req.user});
        // await redisService.redis('set', decoded.user_id,req.user);
      }

      next();
    } else {
      req.user = await userRepository.getUserById(
        "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
      );
    }

    next();
  } catch (err) {
    next(new UnauthorizedError(err.message));
  }
};
