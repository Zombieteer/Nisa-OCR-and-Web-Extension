const getUsers = require("./routes/getUsers");
const encryptFile = require("./routes/encryptFile");
const decryptFile = require("./routes/decryptFile");
const registerUser = require("./routes/registerUser");

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const fileUpload = require("express-fileupload");
const cors = require("cors");

// const config = require("./client_secret.json");
// const cookieParser = require("cookie-parser");
// const { google } = require("googleapis");
// const firebase = require("firebase-admin");
// const encyptor = require("encryptor-node");
// const nodeRsa = require("node-rsa");
// const stream = require("stream");
// const CLIENT_ID = config.web.client_id;
// const CLIENT_SECRET = config.web.client_secret;
// const REDIRECT_URL = config.web.redirect_uris;
// const ENCRYPTION_SECRET = "codalyze";

const app = express();

const db = require("./db");

app.use(logger("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "build")));
app.use(cors());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

// Routes

app.get("/api/sql", (req, res, next) => {
  db.any('SELECT * FROM public."user"')
    .then((rows) => {
      console.log(rows);
      res.json(rows);
    })
    .catch((err) => console.log(err));
});

app.get("/api", (req, res, next) => {
  res.json({ hello: "ok" }).end();
});

app.get("/receive", function (req, res, next) {
  res.json({ status: "ok" });
});

app.use("/api/send", encryptFile);

app.use("/api/receive", decryptFile);

app.use("/api/users", getUsers);

app.use("/api/register", registerUser);

app.get("*", (req, res, next) => {
  res.sendFile(path.join(__dirname + "/build/index.html"));
});

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.json({ status: 404 });
});

module.exports = app;
