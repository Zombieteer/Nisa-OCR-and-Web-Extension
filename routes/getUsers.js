const express = require("express");
const router = express.Router();

const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore({ projectId: "project-ocr-150620" });

router.get("/", async (req, res, next) => {
  const document = firestore.doc("project-ocr/keystore");
  try {
    const doc = await document.get();
    if (!doc.exists) {
      res.json({ status: "ok", users: [] });
    } else {
      const data = doc.data();
      const users = data.users.map((user) => ({ email: user.email }));
      res.json({ users, status: "ok" });
    }
  } catch (e) {
    console.log(e);
    res.json({ error: e });
  }
});

module.exports = router;
