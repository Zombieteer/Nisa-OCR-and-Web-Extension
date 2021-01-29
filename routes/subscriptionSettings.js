const express = require("express");
const router = express.Router();
const { executeQuery, update } = require("../db");

router.get("/", async (req, res, next) => {
  try {
    let result = (await executeQuery(`SELECT * FROM files `)).rows;
    if (result) {
      let subSet, nonSubSet;
      result.forEach((set) => {
        set.is_subscribed ? (subSet = set) : (nonSubSet = set);
      });
      res.send({
        status: "success",
        settings: { subSet, nonSubSet },
      });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "unsuccess", error: "Something went wrong" });
  }
});

router.post("/", async (req, res, next) => {
  let subSet = req.body.subSettings;
  let nonSubSet = req.body.nonSubSettings;
  try {
    await update({ ...subSet }, "files", {
      is_subscribed: subSet.is_subscribed,
    });
    await update({ ...nonSubSet }, "files", {
      is_subscribed: nonSubSet.is_subscribed,
    });
    res.send({ status: "success", msg: "Settings updated" });
  } catch (error) {
    console.log(error);
    res.send({ status: "unsuccess", error: "Something went wrong" });
  }
});

module.exports = router;
