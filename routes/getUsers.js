const express = require("express");
const router = express.Router();
const { executeQuery } = require("../db");

// const { Firestore } = require("@google-cloud/firestore");
// const firestore = new Firestore({ projectId: "project-ocr-150620" });

router.get("/", async (req, res, next) => {
  // const document = firestore.doc("project-ocr/keystore");

  try {
    let users = (await executeQuery("SELECT * FROM users")).rows;
    users = users.map((obj) => {
      return obj;
    });
    res.json({ users, status: "ok" });
  } catch (e) {
    console.log(e);
    res.send({ status: "unsuccess", error: "Something went wrong" });
  }

  // try {
  //   const doc = await document.get();
  //   if (!doc.exists) {
  //     res.json({ status: "ok", users: [] });
  //   } else {
  //     const data = doc.data();
  //     const users = data.users.map((user) => ({ email: user.email }));
  //     res.json({ users, status: "ok" });
  //   }
  // } catch (e) {
  //   console.log(e);
  //   res.json({ error: e });
  // }
});

module.exports = router;
