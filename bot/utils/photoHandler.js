const s3 = require('../services/s3');

module.exports = {
  processPhoto: async (photoUrl) => {
    try {
      const fileName = `photos/${Date.now()}ph.jpg`; // Добавили .jpg
      await s3.uploadPhoto(
        photoUrl,
        process.env.S3_BUCKET_NAME,
        fileName
      );
      
      const photoLink = process.env.S3_PUBLIC_URL 
        ? `${process.env.S3_PUBLIC_URL}/${fileName}`
        : "нет фото";
      
      console.log(`Photo saved: ${photoLink}`); // Логируем результат
      return photoLink;
    } catch (error) {
      console.error('Photo processing failed:', error);
      return "ошибка загрузки"; // Возвращаем строку вместо throw для устойчивости
    }
  }
};