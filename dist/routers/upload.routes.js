"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../middlewares/upload");
const upload_controller_1 = require("../controller/upload.controller");
const router = (0, express_1.Router)();
// Single file upload to imgBB (e.g., profile picture)
router.post('/profile', (0, upload_1.uploadSingleImgBB)('profile'), upload_controller_1.uploadSingleFile);
// Multiple travel images upload to imgBB
router.post('/travel-images', (0, upload_1.uploadMultipleImgBB)('images', 5), upload_controller_1.uploadMultipleFiles);
// Delete file endpoint (imgBB delete via delete_url)
router.delete('/delete', upload_controller_1.deleteUploadedFile);
exports.default = router;
