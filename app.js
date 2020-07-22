const config = require('./client_secret.json')

const createError = require('http-errors')
const express = require('express')
const path = require('path')
const fs = require('fs')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const { google } = require('googleapis')
const { Storage } = require('@google-cloud/storage')
const vision = require('@google-cloud/vision').v1
const { Firestore } = require('@google-cloud/firestore')
const firebase = require('firebase-admin')
const encyptor = require('encryptor-node')
const nodeRsa = require('node-rsa')

const { PDFDocument } = require('pdf-lib')
const stream = require('stream')

const CLIENT_ID = config.web.client_id
const CLIENT_SECRET = config.web.client_secret
const REDIRECT_URL = config.web.redirect_uris

const GOOGLE_SERVICE_KEY = 'project-ocr.json'

// Service key is required below
const visionClient = new vision.ImageAnnotatorClient({ keyFilename: GOOGLE_SERVICE_KEY, projectId: 'project-ocr' })
// const authClient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
const storage = new Storage({ keyFile: 'project-ocr.json', projectId: 'project-ocr-282210' })
const firestore = new Firestore({ projectId: 'project-ocr-282210' })

const app = express()

app.use(logger('tiny'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'build')))
app.use(cors())
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }))

// Routes

app.get('/api', (req, res, next) => {
  res.json({ hello: 'ok' }).end()
})

app.post('/api/send', async (req, res, next) => {
  const sentFile = req.files.file
  const { email } = req.body

  const bucketName = 'project-ocr-bucket'
  const fileName = `${sentFile.name.split('.')[0]}.pdf`

  const uploadFile = async () => {
    await storage.bucket(bucketName).upload(sentFile.tempFilePath, {
      destination: fileName,
    })
    console.log('UPLOAD STATUS')
    console.log(`Created object gs://${bucketName}/${fileName}`)
    console.log('------------------------------------------------------')
  }

  const getFileByPrefix = async (prefix) => {
    const [files] = await storage.bucket('project-ocr-bucket').getFiles({ prefix })
    // console.log(files[0])
    return files[0]
  }

  const performOCR = async () => {
    const gcsSourceUri = `gs://${bucketName}/${fileName}`
    const prefix = 'output' + fileName
    const gcsDestinationUri = `gs://${bucketName}/${prefix}/`

    const inputConfig = {
      // NOTE: Supported mime_types are: 'application/pdf' and 'image/tiff' only
      mimeType: 'application/pdf',
      gcsSource: {
        uri: gcsSourceUri,
      },
    }

    const outputConfig = {
      gcsDestination: {
        uri: gcsDestinationUri,
      },
    }

    const features = [{ type: 'DOCUMENT_TEXT_DETECTION' }]
    const request = {
      requests: [
        {
          inputConfig: inputConfig,
          features: features,
          outputConfig: outputConfig,
        },
      ],
    }

    const [operation] = await visionClient.asyncBatchAnnotateFiles(request)
    const [filesResponse] = await operation.promise()
    const destinationUri = filesResponse.responses[0].outputConfig.gcsDestination.uri
    console.log('OCR STATUS')
    console.log('JSON saved to: ' + destinationUri)
    console.log('------------------------------------------------------')
    return prefix
  }

  // const downloadFile = async (file) => {
  //   const rsaKey = new nodeRsa({ b: 512 })
  //   const fileBuffer = await file.download()
  //   const fileJSON = JSON.parse(fileBuffer)

  //   const textContent = rsaKey.encryptPrivate(
  //     JSON.stringify(fileJSON.responses.map((response) => response.fullTextAnnotation.text)),
  //     'base64'
  //   )

  //   //print public key
  //   const publicPem = rsaKey.exportKey('pkcs8-public-pem')
  //   // console.log(publicPem)
  //   // type array of encrypted text
  //   return [textContent, publicPem]
  // }

  const encryptFile = async (ocrFile, email) => {
    const document = firestore.doc('project-ocr/keystore')

    const fileBuffer = await ocrFile.download()
    const fileJSON = JSON.parse(fileBuffer)
    const textContent = fileJSON.responses.map((response) => response.fullTextAnnotation.text)

    try {
      const doc = await document.get()
      if (!doc.exists) {
        res.json({ status: 404 })
      } else {
        const data = doc.data()
        const { secret } = data.users.find((user) => user.email === email)
        console.log(secret)
        const result = encyptor.encrypt(secret, textContent)
        fs.readFile(sentFile.tempFilePath, async (err, data) => {
          if (err) console.log(err)
          else {
            const pdf = await PDFDocument.load(data)
            pdf.setAuthor(result)
            const pdfBytes = await pdf.save()
            fs.writeFile('done.pdf', pdfBytes, (err, data) => {
              if(err) console.log(err)
              else {
                return res.download('done.pdf')
              }
            })
          }
        })
        // console.log(result)
        // fs.writeFile('encrypted.txt', result, (err) => {
        //   if (err) console.log(err)
        //   else {
        //     res.download('encrypted.txt')
        //   }
        // })
      }
    } catch (e) {
      console.log(e)
      res.json({ error: e })
    }
  }

  try {
    uploadFile()
      .then(() => performOCR())
      .then((prefix) => getFileByPrefix(prefix))
      // .then((file) => downloadFile(file))
      .then((ocrFile) => encryptFile(ocrFile, email))
    // .then((result) => res.json({ ...result, status: 'ok' }))
  } catch (e) {
    console.log(e)
    res.redirect('/')
  }
})

app.get('/receive', function (req, res, next) {
  res.json({ status: 'ok' })
})

app.post('/api/receive', async (req, res, next) => {
  console.log(req.body)
  const { email } = req.body
  const file = req.files.file
  console.log(file)
  // TODO: use firebase to get secret
  const secret = Buffer.from(email).toString('base64')
  fs.readFile(file.tempFilePath, 'utf8', (err, data) => {
    if (err) throw err
    else {
      try {
        const results = encyptor.decrypt(secret, data)
        console.log(results)
        res.json({ results, status: 'ok' })
      } catch (e) {
        res.json({ error: 'Decryption failed, Document is tampered or wrong sender selected' })
      }
    }
  })
})

app.get('/api/users', async (req, res, next) => {
  const document = firestore.doc('project-ocr/keystore')
  try {
    const doc = await document.get()
    if (!doc.exists) {
      res.json({ status: 'ok', users: [] })
    } else {
      const data = doc.data()
      const users = data.users.map((user) => ({ email: user.email }))
      res.json({ users, status: 'ok' })
    }
  } catch (e) {
    console.log(e)
    res.json({ error: e })
  }
})

app.post('/api/register', async (req, res, next) => {
  console.log('req body')
  console.log(req.body)
  const { email } = req.body
  const secret = Buffer.from(email).toString('base64')
  const document = firestore.doc('project-ocr/keystore')

  try {
    const doc = await document.get()
    if (!doc.exists) {
      await document.set({ users: [{ email, secret }] })
      res.json({ status: 'ok' })
    } else {
      const data = doc.data()
      const registeredUser = data.users.find((user) => user.email === email)
      if (!registeredUser) {
        let newUsers = data.users.concat({ email, secret })
        data.users = newUsers
        await document.set(data)
        res.json({ status: 'ok' })
      } else {
        res.status(200).end()
      }
    }
  } catch (e) {
    console.log(e)
    res.json({ error: e })
  }
})
app.get('*', (req, res, next) => {
  res.sendFile(path.join(__dirname + '/build/index.html'))
})

app.use((req, res, next) => {
  next(createError(404))
})

app.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  res.status(err.status || 500)
  res.json({ status: 404 })
})

module.exports = app
