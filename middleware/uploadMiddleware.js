const multer = require('multer');

// Use memory storage to avoid saving to disk
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
