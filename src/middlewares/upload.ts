import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { uploadToImgBB } from '../utils/imgbb';

// Extend Request interface for TypeScript
declare global {
  namespace Express {
    interface Request {
      fileInfo?: {
        url: string;
        delete_url?: string;
        thumb_url?: string;
        filename: string;
        size: number;
        mimetype: string;
      };
      filesInfo?: {
        [key: string]: {
          url: string;
          delete_url?: string;
          thumb_url?: string;
          filename: string;
          size: number;
          mimetype: string;
        }[] | undefined;
      };
    }
  }
}

// Memory storage for imgBB uploads
const memoryStorage = multer.memoryStorage();

const imgbbUpload = multer({
  storage: memoryStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type. Only images allowed for imgBB'));
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB (imgBB free limit is 32MB)
});

// Single file upload to imgBB
export const uploadSingleImgBB = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    imgbbUpload.single(fieldName)(req, res, async (err) => {
      if (err) return next(createError(400, err.message));
      if (!req.file) return next(createError(400, 'No file uploaded'));

      try {
        // Convert buffer to base64
        const base64Image = req.file.buffer.toString('base64');
        const result = await uploadToImgBB(base64Image, req.file.originalname);
        
        req.fileInfo = {
          url: result.url,
          delete_url: result.delete_url,
          thumb_url: result.thumb_url,
          filename: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        };
        next();
      } catch (error) {
        next(createError(500, 'imgBB upload failed'));
      }
    });
  };
};

// Multiple files upload to imgBB
export const uploadMultipleImgBB = (fieldName: string, maxCount = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    imgbbUpload.array(fieldName, maxCount)(req, res, async (err) => {
      if (err) return next(createError(400, err.message));
      if (!req.files || !Array.isArray(req.files)) return next(createError(400, 'No files uploaded'));

      try {
        const files = req.files as Express.Multer.File[];
        const uploadPromises = files.map(async (file) => {
          const base64Image = file.buffer.toString('base64');
          return await uploadToImgBB(base64Image, file.originalname);
        });
        
        const results = await Promise.all(uploadPromises);

        req.filesInfo = {};
        req.filesInfo[fieldName] = results.map((result, index) => ({
          url: result.url,
          delete_url: result.delete_url,
          thumb_url: result.thumb_url,
          filename: files[index].originalname,
          size: files[index].size,
          mimetype: files[index].mimetype
        }));
        next();
      } catch (error) {
        next(createError(500, 'imgBB upload failed'));
      }
    });
  };
};
