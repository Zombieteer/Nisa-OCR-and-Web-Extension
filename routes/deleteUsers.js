const express = require("express");
const router = express.Router();
const { executeQuery } = require("../db");

router.post("/", async (req, res, next) => {
  let emails = req.body;
  console.log(emails);
  let query = `DELETE FROM users WHERE email IN (`;
  for (let id = 0; id < emails.length; id++) {
    id === emails.length - 1
      ? (query = query + `'${emails[id]}'` + ")")
      : (query = query + `'${emails[id]}'` + ",");
  }
  console.log(query);
    try {
      await executeQuery(query);
      res.json({ status: "success", msg: "user deleted" });
    } catch (e) {
      console.log(e);
      res.send({ status: "unsuccess", error: "Something went wrong" });
    }
});

module.exports = router;
