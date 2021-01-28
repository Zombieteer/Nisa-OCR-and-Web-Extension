const express = require("express");
const router = express.Router();

// const { Firestore } = require("@google-cloud/firestore");
// const firestore = new Firestore({ projectId: "project-ocr-150620" });

const { Storage } = require("@google-cloud/storage");
const storage = new Storage({
  keyFile: "project-ocr.json",
  projectId: "project-ocr-150620",
});

const GOOGLE_SERVICE_KEY = "project-ocr.json";
const vision = require("@google-cloud/vision").v1;
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: GOOGLE_SERVICE_KEY,
  projectId: "project-ocr",
});

const fs = require("fs");
const crypto = require("crypto");
const { PDFDocument } = require("pdf-lib");
const { executeQuery } = require("../db");

router.post("/", async (req, res, next) => {
  if (!req.files || !req.files.file) {
    return res.json({ error: "No file found" });
  }

  if (!req.body.email) {
    return res.json({ error: "Email not found" });
  }

  const sentFile = req.files.file;
  const { email } = req.body;
  const { mailSender } = req.body;
  console.log("sender", email);

  const bucketName = "nisa-project-ocr";
  const fileName = `${sentFile.name.split(".")[0]}.pdf`;

  let user = (await executeQuery(`SELECT * FROM users WHERE email=$1`, [email]))
    .rows[0];

  const uploadFile = async () => {
    await storage.bucket(bucketName).upload(sentFile.tempFilePath, {
      destination: fileName,
    });
    console.log("UPLOAD STATUS");
    console.log(`Created object gs://${bucketName}/${fileName}`);
    console.log("------------------------------------------------------");
  };

  const getFileByPrefix = async (prefix) => {
    const [files] = await storage
      .bucket("nisa-project-ocr")
      .getFiles({ prefix });
    // console.log(files[0])
    return files[0];
  };

  const performOCR = async () => {
    console.log("1");
    const gcsSourceUri = `gs://${bucketName}/${fileName}`;
    const prefix = "output" + fileName;
    const gcsDestinationUri = `gs://${bucketName}/${prefix}/`;

    const inputConfig = {
      // NOTE: Supported mime_types are: 'application/pdf' and 'image/tiff' only
      mimeType: "application/pdf",
      gcsSource: {
        uri: gcsSourceUri,
      },
    };

    const outputConfig = {
      gcsDestination: {
        uri: gcsDestinationUri,
      },
    };

    const features = [{ type: "DOCUMENT_TEXT_DETECTION" }];
    const request = {
      requests: [
        {
          inputConfig: inputConfig,
          features: features,
          outputConfig: outputConfig,
        },
      ],
    };

    const [operation] = await visionClient.asyncBatchAnnotateFiles(request);
    const [filesResponse] = await operation.promise();
    const destinationUri =
      filesResponse.responses[0].outputConfig.gcsDestination.uri;
    console.log("OCR STATUS");
    console.log("JSON saved to: " + destinationUri);
    console.log("------------------------------------------------------");
    return prefix;
  };

  const encryptFile = async (ocrFile, email) => {
    // const document = firestore.doc("project-ocr/keystore");

    const fileBuffer = await ocrFile.download();
    const fileJSON = JSON.parse(fileBuffer);
    const textContent = fileJSON.responses.map(
      (response) =>
        response.fullTextAnnotation && response.fullTextAnnotation.text
    );

    try {
      await executeQuery(`UPDATE users SET total_files = $2 WHERE email=$1`, [
        email,
        user.total_files + 1,
      ]);
      console.log(1);
      console.log("encrypt email", mailSender);
      const secret = Buffer.from(mailSender).toString("base64");

      const result = crypto
        .createHash("md5")
        .update(secret + textContent)
        .digest("hex");
      console.log("Result is");
      console.log(result);
      fs.readFile(sentFile.tempFilePath, async (err, data) => {
        if (err) console.log(err);
        else {
          const pdf = await PDFDocument.load(data);
          pdf.setAuthor(result);
          console.log(2);
          const pdfBytes = await pdf.save();
          fs.writeFile("done.pdf", pdfBytes, (err, data) => {
            if (err) console.log(err);
            else {
              console.log(3);
              return res.download("done.pdf");
            }
          });
        }
      });
    } catch (e) {
      console.log(e);
      res.json({ error: e });
    }

    // try {
    //   const doc = await document.get();
    //   if (!doc.exists) {
    //     res.json({ status: 404 });
    //   } else {
    //     const data = doc.data();
    //     console.log(1);
    //     // const { secret } = data.users.find((user) => user.email === email);
    //     // console.log(JSON.stringify(secret, null, 2));
    //     console.log("encrypt email", email);
    //     const secret = Buffer.from(email).toString("base64");

    //     const result = crypto
    //       .createHash("md5")
    //       .update(secret + textContent)
    //       .digest("hex");
    //     console.log("Result is");
    //     console.log(result);
    //     fs.readFile(sentFile.tempFilePath, async (err, data) => {
    //       if (err) console.log(err);
    //       else {
    //         const pdf = await PDFDocument.load(data);
    //         pdf.setAuthor(result);
    //         console.log(2);
    //         const pdfBytes = await pdf.save();
    //         fs.writeFile("done.pdf", pdfBytes, (err, data) => {
    //           if (err) console.log(err);
    //           else {
    //             console.log(3);
    //             return res.download("done.pdf");
    //           }
    //         });
    //       }
    //     });
    //   }
    // } catch (e) {
    //   console.log(e);
    //   res.json({ error: e });
    // }
  };

  if (user && user.total_files < user.file_limit) {
    let size_allowed = user.is_subscribed
      ? sentFile.size / 1000 < user.filesize_upper_limit
      : sentFile.size / 1000 < user.filesize_lower_limit;
    console.log(size_allowed);
    if (size_allowed) {
      try {
        uploadFile()
          .then(() => performOCR())
          .then((prefix) => getFileByPrefix(prefix))
          // .then((file) => downloadFile(file))
          .then((ocrFile) => encryptFile(ocrFile, email));
        // .then((result) => res.json({ ...result, status: 'ok' }))
      } catch (e) {
        console.log(e);
        res.redirect("/");
      }
    } else {
      console.log("failed");
      res.json({ status: "failed", msg: "encryption not allowed" });
    }
  } else {
    console.log("file limit exceeded");
    res.json({ status: "failed", msg: "file limit exceeded" });
  }
});

module.exports = router;
