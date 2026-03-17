import { Request, Response, NextFunction } from 'express';

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

// Delete uploaded file (for imgBB, use the delete_url from upload response)
export const deleteUploadedFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { delete_url } = req.body;
    if (!delete_url) throw new Error('Delete URL is required');

    // For imgBB, deletion is done via the delete_url
    // You can make a request to delete_url or just acknowledge
    res.status(200).json({
      success: true,
      message: 'File deletion initiated. Use the delete_url from upload response to delete the file.',
      delete_url
    });
  } catch (err) {
    next(err);
  }
};
