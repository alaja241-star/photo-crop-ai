import express from 'express';
import {
  analyzeCropDisease,
  getDiseaseAnalyses,
  getDiseaseAnalysis,
  deleteDiseaseAnalysis,
  getDiseaseStats,
  getDiseaseImage,
} from '../controllers/disease.js';
import { protect } from '../middleware/auth.js';
import { uploadSingle, cleanupOnError } from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   POST /api/disease/analyze
router.post('/analyze', cleanupOnError, uploadSingle('cropImage'), analyzeCropDisease);

// @route   GET /api/disease
router.get('/', getDiseaseAnalyses);

// @route   GET /api/disease/stats
router.get('/stats', getDiseaseStats);

// @route   GET /api/disease/:id/image
router.get('/:id/image', getDiseaseImage);

// @route   GET /api/disease/:id
router.get('/:id', getDiseaseAnalysis);

// @route   DELETE /api/disease/:id
router.delete('/:id', deleteDiseaseAnalysis);

export default router;
