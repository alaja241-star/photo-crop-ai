import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { Request, Response, NextFunction } from 'express';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const cropDir = path.join(uploadDir, 'crops');
const soilDir = path.join(uploadDir, 'soil');

[uploadDir, cropDir, soilDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    // Route destination on the field name only. (The previous version also read
    // req.route.path, which can be undefined under Express 5 and throw.)
    let uploadPath = uploadDir;
    if (file.fieldname === 'cropImage') uploadPath = cropDir;
    else if (file.fieldname === 'soilImage') uploadPath = soilDir;
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  },
});

// File filter function
const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'));
  }
};

// Configure multer
const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize,
    files: 1,
  },
  fileFilter,
});

// Middleware for single image upload
export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const singleUpload = upload.single(fieldName);

    singleUpload(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ success: false, error: 'File too large. Maximum size is 10MB.' });
          return;
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          res.status(400).json({ success: false, error: 'Unexpected file field.' });
          return;
        }
        res.status(400).json({ success: false, error: err.message });
        return;
      } else if (err) {
        res.status(400).json({ success: false, error: (err as Error).message });
        return;
      }

      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({ success: false, error: 'Please upload an image file.' });
        return;
      }

      next();
    });
  };
};

// Middleware for multiple image upload
export const uploadMultiple = (fieldName: string, maxCount = 5) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const multipleUpload = upload.array(fieldName, maxCount);

    multipleUpload(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ success: false, error: 'File too large. Maximum size is 10MB.' });
          return;
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          res.status(400).json({ success: false, error: `Too many files. Maximum is ${maxCount}.` });
          return;
        }
        res.status(400).json({ success: false, error: err.message });
        return;
      } else if (err) {
        res.status(400).json({ success: false, error: (err as Error).message });
        return;
      }

      // Check if files were uploaded
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        res.status(400).json({ success: false, error: 'Please upload at least one image file.' });
        return;
      }

      next();
    });
  };
};

// Utility function to delete uploaded file
export const deleteFile = (filePath: string): boolean => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Middleware to clean up files on error
export const cleanupOnError = (req: Request, res: Response, next: NextFunction): void => {
  const originalSend = res.send.bind(res);

  res.send = function (data: unknown) {
    // If there's an error and we have uploaded files, clean them up
    if (res.statusCode >= 400) {
      if (req.file) {
        deleteFile(req.file.path);
      }
      if (req.files && (req.files as Express.Multer.File[]).length > 0) {
        (req.files as Express.Multer.File[]).forEach((file) => deleteFile(file.path));
      }
    }

    return originalSend(data as never);
  };

  next();
};

export default upload;
