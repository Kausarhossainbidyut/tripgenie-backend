import { Request, Response, NextFunction } from 'express';
import { deleteFile } from '../middlewares/upload';

// Upload controller
export const uploadSingleFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.fileInfo) throw new Error('No file uploaded');

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: req.fileInfo
    });
  } catch (err) {
    next(err);
  }
};

// Multiple files controller
export const uploadMultipleFiles = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.filesInfo) throw new Error('No files uploaded');

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      files: req.filesInfo
    });
  } catch (err) {
    next(err);
  }
};

// Delete uploaded file example
export const deleteUploadedFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filePath } = req.body;
    if (!filePath) throw new Error('File path is required');

    await deleteFile(filePath);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
