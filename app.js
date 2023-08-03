const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');

// Replace with your own AWS credentials and S3 bucket name
const awsConfig = {
  region: 'ap-southeast-1',
  accessKeyId: '',
  secretAccessKey: '',
  bucketName: '',
};

const app = express();
const storage = multer.memoryStorage()
const upload = multer({storage: storage});

// Configure AWS
AWS.config.update(awsConfig);
const s3 = new AWS.S3();

// Define the POST endpoint for uploading the image
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const imageContent = req.file.buffer;
  const fileName = req.file.originalname;

  const params = {
    Bucket: awsConfig.bucketName,
    Key: fileName,
    Body: imageContent,
  };

  // Upload the image to S3
  s3.upload(params, (err, data) => {
    if (err) {
      console.error('Error uploading image:', err);
      return res.status(500).json({ error: 'Failed to upload image to S3' });
    }

    // The image was successfully uploaded to S3
    // The S3 URL of the image is available in the 'Location' property of 'data'
    const imageUrl = data.Location;
    console.log('Image uploaded to:', imageUrl);
    res.status(200).json({ imageUrl });
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

