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
  accessKeyId: "AKIAROSQOUGIJURQ6P5G",
  secretAccessKey: "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",
  region: "eu-west-2" 
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "pitchlane",
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

app.get('/api/retrieve', (req, res) => {
  console.log("Retrieving all video URLs");

  const videoUrls = [];
  
  new aws.S3().listObjectsV2({ Bucket: "pitchlane" }, function(err, data) {
    if (err) {
      console.error("Error listing objects in S3 bucket:", err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      data.Contents.forEach((object) => {
        const videoUrl = `https://pitchlane.s3.amazonaws.com/${object.Key}`;
        videoUrls.push(videoUrl);
      });

      res.json({ videoUrls });
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server Listening on port ${PORT}`);
  });