require('dotenv').config();
const AWS = require('aws-sdk');
const fetch = require('node-fetch');

const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: process.env.S3_REGION,
  s3ForcePathStyle: true,
});

module.exports = {
  uploadPhoto: async (fileUrl, bucketName, key) => {
    try {
      // Скачиваем файл из Telegram
      const response = await fetch(fileUrl);            
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);      
      const buffer = await response.buffer();
      
      // Загружаем в S3
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      };
      
      
      const result = await s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw error;
    }
    
  }
};