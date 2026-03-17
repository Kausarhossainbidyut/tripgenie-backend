import { Router } from 'express';
import { uploadSingleImgBB, uploadMultipleImgBB } from '../middlewares/upload';
import {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteUploadedFile
} from '../controller/upload.controller';

const router = Router();

// Single file upload to imgBB (e.g., profile picture)
router.post('/profile', uploadSingleImgBB('profile'), uploadSingleFile);

// Multiple travel images upload to imgBB
router.post('/travel-images', uploadMultipleImgBB('images', 5), uploadMultipleFiles);

// Delete file endpoint (imgBB delete via delete_url)
router.delete('/delete', deleteUploadedFile);

export default router;
