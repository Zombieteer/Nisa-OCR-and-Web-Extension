const express = require("express");
const router = express.Router();

const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore({ projectId: "project-ocr-150620" });

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

router.post("/", async (req, res, next) => {
  if (!req.files || !req.files.file) {
    return res.json({ error: "No file found" });
  }

  if (!req.body.email) {
    return res.json({ error: "Please choose a sender" });
  }
  const sentFile = req.files.file;
  const { email } = req.body;
  console.log(sentFile.data);
  fs.readFile(sentFile.tempFilePath, {}, async (err, data) => {
    if (err) console.log(err);
    const pdf = await PDFDocument.load(data);
    const hash = pdf.getAuthor();
    if (!hash) {
      return res.json({ error: "Decryption failed, Document is tampered" });
    }
    console.log(hash);
    console.log(1);

    const bucketName = "nisa-project-ocr";
    const fileName = `${sentFile.name.split(".")[0]}.pdf`;

    const uploadFile = async () => {
      console.log(2);
      await storage.bucket(bucketName).upload(sentFile.tempFilePath, {
        destination: fileName,
      });
      console.log("UPLOAD STATUS");
      console.log(`Created object gs://${bucketName}/${fileName}`);
      console.log("------------------------------------------------------");
    };

    const performOCR = async () => {
      console.log(3);
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

    const getFileByPrefix = async (prefix) => {
      console.log(4);
      const [files] = await storage
        .bucket("nisa-project-ocr")
        .getFiles({ prefix });
      // console.log(files[0])
      return files[0];
    };

    const encryptFile2 = async (ocrFile) => {
      console.log(5);

      const fileBuffer = await ocrFile.download();
      const fileJSON = JSON.parse(fileBuffer);
      const textContent = fileJSON.responses.map(
        (response) =>
          response.fullTextAnnotation && response.fullTextAnnotation.text
      );

      console.log(5.1);

      // asf

      const document = firestore.doc("project-ocr/keystore");
      try {
        const doc = await document.get();
        if (!doc.exists) {
          res.json({ status: 404 });
        } else {
          const data = doc.data();
          // const { secret } = data.users.find((user) => user.email === email);
        console.log("decrypt email", email);
        const secret = Buffer.from(email).toString("base64");
          // if (!secret) {
          //   res.json({ error: "Cannot find the selected user" });
          // }
          console.log(secret);
          const result = crypto
            .createHash("md5")
            .update(secret + textContent)
            .digest("hex");

          console.log("Result is ");

          console.log(5.2);

          console.log("result is ", result);
          console.log("hash is ", hash);
          if (result === hash) {
            console.log("success");
            res.json({ status: "ok" });
          } else {
            console.log("failed");
            res.json({
              error:
                "Decryption failed, Document is tampered, or wrong sender selected",
            });
          }
        }
      } catch (e) {
        console.log(e);
        res.json({ error: "Cannot find the selected user" });
      }
    };

    try {
      uploadFile()
        .then(() => performOCR())
        .then((prefix) => getFileByPrefix(prefix))
        .then((ocrFile) => encryptFile2(ocrFile));
    } catch (e) {
      console.log(e);
      res.redirect("/");
    }
  });
});

module.exports = router;
