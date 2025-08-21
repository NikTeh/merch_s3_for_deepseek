require('dotenv').config();
const AWS = require('aws-sdk');
// const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION,
    s3ForcePathStyle: true,
});

module.exports = {
    processSurveyPhoto: async (fileBuffer, originalName) => {
        try {
            // Генерируем уникальное имя файла
            const fileExtension = originalName.split('.').pop().toLowerCase();
            // const fileName = `survey/${uuidv4()}.${fileExtension}`;
            const fileName = `survey/photophorm.${fileExtension}`;
            
            // Параметры для загрузки в S3
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: fileName,
                Body: fileBuffer,
                ContentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
                ACL: 'public-read'
            };
            
            // Загружаем в S3
            const result = await s3.upload(params).promise();
            
            // Формируем публичную ссылку
            const photoUrl = process.env.S3_PUBLIC_URL 
                ? `${process.env.S3_PUBLIC_URL}/${fileName}`
                : result.Location;
            
            console.log(`Survey photo saved: ${photoUrl}`);
            return photoUrl;
            
        } catch (error) {
            console.error('Survey photo processing failed:', error);
            throw new Error('Ошибка загрузки фотографии');
        }
    }
};