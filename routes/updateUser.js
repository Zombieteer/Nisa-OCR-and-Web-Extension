const express = require("express");
const router = express.Router();
const { executeQuery, update } = require("../db");
const moment = require("moment");

router.post("/", async (req, res, next) => {
  const user = req.body;
  try {
    let result = (
      await executeQuery(`SELECT * FROM users WHERE email=$1`, [user.email])
    ).rows[0];
    if (result) {
      if (user.is_subscribed || user.role === "admin") {
        result = await update(
          {
            ...user,
            is_subscribed: 1,
            file_limit: 1000,
            updated_on: moment().format("LLL"),
          },
          "users",
          { id: result.id }
        );
      } else {
        result = await update(
          {
            ...user,
            is_subscribed: 0,
            file_limit: 10,
            updated_on: moment().format("LLL"),
          },
          "users",
          { id: result.id }
        );
      }
      res.send({ status: "success", msg: `user updated` });
    }
  } catch (error) {
    console.log(e);
    res.send({ status: "unsuccess", error: "Something went wrong" });
  }
});

module.exports = router;
