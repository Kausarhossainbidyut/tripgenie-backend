import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';

// Extend Request interface for TypeScript
declare global {
  namespace Express {
    interface Request {
      fileInfo?: {
        filename: string;
        path: string;
        size: number;
        mimetype: string;
      };
      filesInfo?: {
        [key: string]: {
          filename: string;
          path: string;
          size: number;
          mimetype: string;
        }[] | undefined;
      };
    }
  }
}

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/audio',
    'uploads/images',
    'uploads/documents',
    'uploads/profiles'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    createUploadDirs();

    if (file.mimetype.startsWith('audio/')) cb(null, 'uploads/audio');
    else if (file.mimetype.startsWith('image/')) cb(null, 'uploads/images');
    else if (file.mimetype.includes('pdf') || file.mimetype.includes('document')) cb(null, 'uploads/documents');
    else cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = {
    audio: ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/mp4'],
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  if (file.mimetype.startsWith('audio/')) {
    allowedTypes.audio.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid audio type'));
  } else if (file.mimetype.startsWith('image/')) {
    allowedTypes.image.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid image type'));
  } else if (file.mimetype.includes('pdf') || file.mimetype.includes('document')) {
    allowedTypes.document.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid document type'));
  } else {
    cb(new Error('Invalid file type'));
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024, files: 10 } // 50MB, max 10 files
});

// Single file upload
export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('DEBUG: Expecting field name:', fieldName);
    console.log('DEBUG: Request headers:', req.headers['content-type']);
    upload.single(fieldName)(req, res, err => {
      if (err instanceof multer.MulterError) {
        console.log('DEBUG: MulterError:', err.code, err.message, err.field);
        if (err.code === 'LIMIT_FILE_SIZE') return next(createError(400, 'File exceeds 50MB'));
        if (err.code === 'LIMIT_FILE_COUNT') return next(createError(400, 'Too many files uploaded'));
        return next(createError(400, `Expected '${fieldName}' but received '${err.field}'`));
      } else if (err) {
        console.log('DEBUG: Other error:', err.message);
        return next(createError(400, err.message));
      }

      if (req.file) {
        req.fileInfo = {
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
          mimetype: req.file.mimetype
        };
      }

      next();
    });
  };
};

// Multiple files upload
export const uploadMultiple = (fieldName: string, maxCount = 10) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName, maxCount)(req, res, err => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return next(createError(400, 'File exceeds 50MB'));
        if (err.code === 'LIMIT_FILE_COUNT') return next(createError(400, `Max ${maxCount} files allowed`));
        return next(createError(400, err.message));
      } else if (err) return next(createError(400, err.message));

      if (req.files && Array.isArray(req.files)) {
        req.filesInfo = {};
        req.filesInfo[fieldName] = req.files.map(file => ({
          filename: file.filename,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        }));
      }

      next();
    });
  };
};

// Mixed fields upload
export const uploadFields = (fields: { name: string; maxCount: number }[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.fields(fields)(req, res, err => {
      if (err instanceof multer.MulterError || err) return next(createError(400, err.message));

      if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
        req.filesInfo = {};
        Object.keys(req.files).forEach(key => {
          const f = (req.files as { [fieldname: string]: Express.Multer.File[] })[key];
          if (Array.isArray(f)) {
            req.filesInfo![key] = f.map(file => ({
              filename: file.filename,
              path: file.path,
              size: file.size,
              mimetype: file.mimetype
            }));
          }
        });
      }

      next();
    });
  };
};

// Delete file utility
export const deleteFile = (filePath: string) =>
  new Promise<void>((resolve, reject) => {
    fs.unlink(filePath, err => (err ? reject(err) : resolve()));
  });

// Cleanup files on error
export const cleanupFiles = (req: Request, res: Response, next: NextFunction) => {
  const cleanup = () => {
    if (req.file) deleteFile(req.file.path).catch(console.error);

    if (req.files) {
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      files.forEach(f => deleteFile(f.path).catch(console.error));
    }
  };

  const originalNext = next;
  next = function (err?: any) {
    if (err) cleanup();
    originalNext(err);
  };

  res.on('finish', () => {
    if (res.statusCode >= 400) cleanup();
  });

  return next();
};
