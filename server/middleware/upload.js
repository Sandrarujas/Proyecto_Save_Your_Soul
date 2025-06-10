// server/middleware/upload.js
const multer = require('multer');
const path = require('path');

// Carpeta donde guardarás los uploads (asegúrate de que existe /uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Ejemplo: usuarioId-timestamp.ext
    const ext = path.extname(file.originalname);
    const name = `${req.user.id}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Formato de imagen no soportado'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
