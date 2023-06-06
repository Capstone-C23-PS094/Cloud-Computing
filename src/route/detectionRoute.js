// import express from 'express';
// const router = express.Router();
// import { upload } from '../middleware/multer.js';
// import { Storage } from '@google-cloud/storage';
// import dbPool from '../config/connection.js';
// // import { nanoid } from 'nanoid';
// // import { detectionValidate } from '../validation/detectionSchema.js';


// // Buat instansi penyimpanan Google Cloud Storage
// const storage = new Storage({
//   projectId: 'farmgenius-ccd7d',
//   keyFilename: './serviceKeyAccount.json',
// });

// // Buat instansi bucket Google Cloud Storage yang akan digunakan
// const bucketName = 'farmgenius-bucket-test';
// const bucket = storage.bucket(bucketName);

// // Definisikan rute POST untuk mendeteksi gambar dan menyimpan entri histori gambar
// router.post('/upload', upload.single('image'), (req, res, next) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }

//   // Buat nama unik untuk file yang diunggah
//   const fileName = Date.now() + '-' + req.file.originalname;

//   // Buat objek blob untuk file yang akan diunggah
//   const blob = bucket.file(fileName);

//   // Mulai mengunggah file ke Google Cloud Storage
//   const blobStream = blob.createWriteStream();

//   blobStream.on('error', (err) => {
//     next(err);
//   });

//   blobStream.on('finish', () => {
//     // Ubah izin akses file yang diunggah menjadi publik
//     blob.makePublic()
//       .then(() => {
//         // Dapatkan URL akses publik ke file yang diunggah
//         const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

//         // Simpan entri histori gambar ke MySQL
//         const detectionEntry = {
//             fileName: fileName,
//             detectionDate: new Date(),
//             detectionResult: 'Result Placeholder',
//             imageUrl: publicUrl,
//           };

//         const query = `INSERT INTO detection SET ?`;

//         dbPool.execute(query, [detectionEntry])

//           .then(() => {
//             console.log('Detection entry saved successfully');
//             return res.json({ imageUrl: publicUrl });
//           })
//           .catch((error) => {
//             console.error('Error saving detection entry:', error);
//             return res.status(500).json({ error: 'Error saving detection entry' });
//           });
//       })
//       .catch(next);
//   });

//   // Tulis data buffer file yang diunggah ke blobStream
//   blobStream.end(req.file.buffer);
// });

// export default router;
import express from 'express';
const router = express.Router();
import { upload } from '../middleware/multer.js';
import { Storage } from '@google-cloud/storage';
import dbPool from '../config/connection.js';
import { nanoid } from 'nanoid';

// Buat instansi penyimpanan Google Cloud Storage
const storage = new Storage({
  projectId: 'farmgenius-ccd7d',
  keyFilename: './serviceKeyAccount.json',
});

// Buat instansi bucket Google Cloud Storage yang akan digunakan
const bucketName = 'farmgenius-bucket-test';
const bucket = storage.bucket(bucketName);

// Definisikan rute POST untuk mendeteksi gambar dan menyimpan entri histori gambar
router.post('/upload', upload.single('image'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Buat nama unik untuk file yang diunggah
  const fileName = Date.now() + '-' + req.file.originalname;

  // Buat objek blob untuk file yang akan diunggah
  const blob = bucket.file(fileName);

  // Mulai mengunggah file ke Google Cloud Storage
  const blobStream = blob.createWriteStream();

  blobStream.on('error', (err) => {
    next(err);
  });

  blobStream.on('finish', () => {
    // Ubah izin akses file yang diunggah menjadi publik
    blob.makePublic()
      .then(() => {
        // Dapatkan URL akses publik ke file yang diunggah
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

        // Simpan entri histori gambar ke MySQL
        const detectionEntry = {
          detection_id: nanoid (),
          fileName: fileName,
          detectionDate: new Date(),
          detectionResult: 'Result Placeholder',
          imageUrl: publicUrl,
        };

        const query = `INSERT INTO detection (fileName, detectionDate, detectionResult, imageUrl) VALUES (?, ?, ?, ?)`;

        dbPool.execute(query, [
          detectionEntry.fileName,
          detectionEntry.detectionDate,
          detectionEntry.detectionResult,
          detectionEntry.imageUrl,
        ])
          .then(() => {
            console.log('Detection entry saved successfully');
            return res.json({ imageUrl: publicUrl });
          })
          .catch((error) => {
            console.error('Error saving detection entry:', error);
            return res.status(500).json({ error: 'Error saving detection entry' });
          });
      })
      .catch(next);
  });

  // Tulis data buffer file yang diunggah ke blobStream
  blobStream.end(req.file.buffer);
});

export default router;
