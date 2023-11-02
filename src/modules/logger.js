const winston = require("winston");

const logLevel = process.env.NODE_ENV === "production" ? "info" : "debug";

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "errors.log", level: "error" }),
  ],
});

module.exports = logger;