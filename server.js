const express = require("express");
const cors = require("cors");
const multer = require('multer');
const aws = require("aws-sdk")
const multerS3 = require('multer-s3');
const dotenv = require('dotenv');

dotenv.config({path:__dirname+'/../.env'})

const app = express();

app.use(cors());

aws.config.update({
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretKey,
  region: process.env.AWSRegion
})

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWSBucket,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileExtension = '.mp4';
      const uniqueFileName = Date.now().toString() + fileExtension;
      cb(null, uniqueFileName);
    }
  })
});

app.post('/api/upload', upload.single('video'), (req, res) => {
  console.log("upload attempted")
  if (req.file) {
    const url = req.file.location;
    res.json({ url: url });
  } else {
    res.status(400).json({ error: 'File upload failed' });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server Listening on port ${PORT}`);
  });