const {
  verifyToken,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} = require("../lib/jwt");

const { UnauthorizedError } = require("./error");

const shouldSkipAuthentication = (req) => {
  const routePath = req.path || req.originalUrl || "";
  return routePath.startsWith("/users/verify") || routePath.startsWith("/users/by-email");
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

      const newRefreshToken = generateRefreshToken({
        username: decodedRefresh.sub,
        ...decodedRefresh.user,
      });

      res.cookie("access_token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
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
