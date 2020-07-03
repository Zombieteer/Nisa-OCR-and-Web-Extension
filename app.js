const config = require('./client_secret.json')

const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const fileUpload = require('express-fileupload')
const { google } = require('googleapis')
const { Storage } = require('@google-cloud/storage')
const vision = require('@google-cloud/vision').v1

const CLIENT_ID = config.web.client_id
const CLIENT_SECRET = config.web.client_secret
const REDIRECT_URL = config.web.redirect_uris

// Service key is required below
const visionClient = new vision.ImageAnnotatorClient({ keyFilename: 'project-ocr.json', projectId: 'project-ocr' })
const authClient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
const storage = new Storage({ keyFile: 'project-ocr.json', projectId: 'project-ocr-282210' })

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('tiny'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }))

// Routes

let authenticated = false

app.get('/', (req, res) => {
  if (!authenticated) {
    // Redirect for OAuth
    const url = authClient.generateAuthUrl({ access_type: 'offline', scope: 'https://www.googleapis.com/auth/drive' })
    res.redirect(url)
  } else {
    res.render('index')
  }
})

app.get('/send', function (req, res, next) {
  res.render('send')
})

app.post('/send', async (req, res, next) => {
  const file = req.files.file
  const bucketName = 'project-ocr-bucket'
  const fileName = `${file.name.split('.')[0]}-input.pdf`

  const uploadFile = async () => {
    await storage.bucket(bucketName).upload(file.tempFilePath, {
      destination: fileName,
    })
    console.log('UPLOAD STATUS')
    console.log(`Created object gs://${bucketName}/${fileName}`)
    console.log('------------------------------------------------------')
  }

  const getFiles = async () => {
    const [files] = await storage.bucket('project-ocr-bucket').getFiles()
    console.log('FILES IN THE STORAGE')
    files.forEach((file) => {
      console.log(file.name)
    })
    console.log('------------------------------------------------------')
  }

  const performOCR = async () => {
    const gcsSourceUri = `gs://${bucketName}/${fileName}`
    const gcsDestinationUri = `gs://${bucketName}/${'ocr' + fileName}/`

    const inputConfig = {
      // NOTE: Supported mime_types are: 'application/pdf' and 'image/tiff'
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
  }

  try {
    uploadFile()
      .then(() => getFiles())
      .then(() => performOCR())

    res.redirect('/send')
  } catch (e) {
    console.log(e)
    res.redirect('/send')
  }
})

app.get('/receive', function (req, res, next) {
  res.render('receive')
})

app.get('/auth/google/callback', (req, res) => {
  const code = req.query.code
  if (code) {
    authClient.getToken(code, function (err, tokens) {
      if (err) {
        console.log('Error authenticating')
        console.log(err)
      } else {
        console.log('Successfully authenticated')
        authClient.setCredentials(tokens)
        authenticated = true
        res.redirect('/')
      }
    })
  }
})

app.use((req, res, next) => {
  next(createError(404))
})

app.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
