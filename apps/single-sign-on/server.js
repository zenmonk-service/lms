require("dotenv").config();
global.argv = process.argv.slice(2);
global.listeningPort = argv[0] || process.env.APP_PORT;
if (!global.listeningPort) {
  console.log("port is not defined. argv = ", argv);
  process.exit(128);
}

const path = require("path");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const cookieParser = require('cookie-parser');
const RedisStore = require("connect-redis").default;

const app = express();
const server = require("http").Server(app);

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(__dirname, "Public"), {}));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Redis connection
const { connectRedisClient } = require("./config/redis");
global.redisClient = connectRedisClient();
app.use(
  session({
    store: new RedisStore({ client: global.redisClient, prefix: "session:" }),
    secret: process.env.REDIS_SESSION_SECRET_KEY ,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      // domain: '.example.local',
      // httpOnly: false,
      maxAge: 1000 * 60 * 60 * 3 // 3 hours in second
      //maxAge: 1000 * 60 * 1440, // 1440 minutes or 1 day
    },
  })
);

// Routes declaration
app.use("/", require("./routes"));

process.on("SIGINT", function () {
  process.exit(0);
});

process.on("uncaughtException", function (err) {
  console.error("uncaughtException--", err);
});

process.on("unhandledRejection", (reason, p) => {
  // application specific logging, throwing an error, or other logic here
  console.error("Unhandled Rejection at:", p, "reason:", reason);
});

app.listen(global.listeningPort, () => {
  console.log(`listening on port ${global.listeningPort}`);
});
