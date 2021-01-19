const express = require("express");
const router = express.Router();

const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore({ projectId: "project-ocr-150620" });

router.post("/", async (req, res, next) => {
  console.log("req body");
  console.log(req.body);
  const { email } = req.body;
  const secret = Buffer.from(email).toString("base64");
  const document = firestore.doc("project-ocr/keystore");

  try {
    const doc = await document.get();
    if (!doc.exists) {
      await document.set({ users: [{ email, secret }] });
      res.json({ status: "ok" });
    } else {
      const data = doc.data();
      const registeredUser = data.users.find((user) => user.email === email);
      if (!registeredUser) {
        let newUsers = data.users.concat({ email, secret });
        data.users = newUsers;
        await document.set(data);
        res.json({ status: "ok" });
      } else {
        res.status(200).end();
      }
    }
  } catch (e) {
    console.log(e);
    res.json({ error: e });
  }
});

module.exports = router;
