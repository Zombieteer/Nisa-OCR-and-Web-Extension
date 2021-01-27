const express = require("express");
const moment = require("moment");
const router = express.Router();
const { insert, executeQuery } = require("../db");

// const { Firestore } = require("@google-cloud/firestore");
// const firestore = new Firestore({ projectId: "project-ocr-150620" });

router.post("/", async (req, res, next) => {
  console.log("req body");
  console.log(req.body);
  const { email } = req.body;
  // const secret = Buffer.from(email).toString("base64");
  // const document = firestore.doc("project-ocr/keystore");

  try {
    let user = (
      await executeQuery(`SELECT * FROM users WHERE email=$1`, [email])
    ).rows[0];
    if (!user) {
      let mainData = {
        ...req.body,
        created_on: moment().format("LLL"),
        updated_on: moment().format("LLL"),
      };
      let result = await insert(mainData, "users");
      if (result.rowCount)
        res.send({ status: "success", msg: "User added", isAdmin: false });
      else res.send({ status: "unsuccess", error: "Something went wrong" });
    } else {
      res.send({ status: "success", msg: "User exists", isAdmin: user.role });
    }
  } catch (error) {
    console.log(error);
    res.json({ error: eroor });
  }

  // try {
  //   const doc = await document.get();
  //   if (!doc.exists) {
  //     await document.set({ users: [{ email, secret }] });
  //     res.json({ status: "ok" });
  //   } else {
  //     const data = doc.data();
  //     const registeredUser = data.users.find((user) => user.email === email);
  //     if (!registeredUser) {
  //       let newUsers = data.users.concat({ email, secret });
  //       data.users = newUsers;
  //       await document.set(data);
  //       res.json({ status: "ok" });
  //     } else {
  //       res.status(200).end();
  //     }
  //   }
  // } catch (e) {
  //   console.log(e);
  //   res.json({ error: e });
  // }
});

module.exports = router;
