const { GenerateRefreshToken } = require("../../single-sign-on/lib/helper");
const {
  verifyToken,
  verifyRefreshToken,
  generateAccessToken,
} = require("../lib/jwt");

const { userRepository } = require("../repositories/user-repository");
const { NotificationType } = require("../services/enum/notification-type.enum");
const { sendNotification } = require("../services/notification-service");
const { UnauthorizedError } = require("./error");

const shouldSkipAuthentication = (req) => {
  const routePath = req.path || req.originalUrl || "";

  return routePath.startsWith("/users/verify");
};

const getTokenFromRequest = (req) => {
  const cookieToken = req.cookies?.access_token;
  if (cookieToken) return cookieToken;

  const authorization = req.headers?.authorization || "";
  if (authorization.startsWith("Bearer ")) {
    return authorization.slice(7).trim();
  }

  return "";
};

const getRefreshTokenFromRequest = (req) => req.cookies?.refresh_token || "";

exports.authenticate = async (req, res, next) => {
  try {
    if (shouldSkipAuthentication(req)) return next();

    const token = getTokenFromRequest(req);
    console.log("token: ", token);

    if (!token) {
      throw new UnauthorizedError("Authentication token not found.");
    }

    let decoded;

    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name !== "TokenExpiredError") {
        throw err;
      }

      const refreshToken = getRefreshTokenFromRequest(req);

      if (!refreshToken) {
        throw new UnauthorizedError("Session expired. Please log in again.");
      }

      const decodedRefresh = verifyRefreshToken(refreshToken);

      const newAccessToken = generateAccessToken({
        username: decodedRefresh.sub,
        ...decodedRefresh.user,
      });

      const newRefreshToken = GenerateRefreshToken({
        username: decodedRefresh.sub,
        ...decodedRefresh.user,
      });

      res.cookie("access_token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
      res.cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
      decoded = decodedRefresh;
    }
    req.decoded = decoded;

    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return next(err);
    }

    next(new UnauthorizedError(err.message));
  }
};
