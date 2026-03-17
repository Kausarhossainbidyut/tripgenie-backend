import { Router } from 'express';
import { uploadSingle, uploadMultiple, uploadFields } from '../middlewares/upload';
import {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteUploadedFile
} from '../controller/upload.controller';

const router = Router();

// Single file upload (e.g., profile picture)
router.post('/profile', uploadSingle('profile'), uploadSingleFile);

// Multiple travel images upload
router.post('/travel-images', uploadMultiple('images', 5), uploadMultipleFiles);

// Mixed fields upload (profile + documents)
router.post(
  '/mixed',
  uploadFields([
    { name: 'profile', maxCount: 1 },
    { name: 'documents', maxCount: 5 }
  ]),
  uploadMultipleFiles
);

// Delete file
router.delete('/delete', deleteUploadedFile);

export default router;
