const pgp = require("pg-promise")();
const connectionString =
  "postgresql://postgres:password@localhost:5432/doclockdb";

const db = pgp(connectionString);

module.exports = db;
