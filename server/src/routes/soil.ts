import express from 'express';
import {
  analyzeSoilFertility,
  getSoilAnalyses,
  getSoilAnalysis,
  deleteSoilAnalysis,
  getSoilStats,
  getSoilImage,
} from '../controllers/soil.js';
import { protect } from '../middleware/auth.js';
import { uploadSingle, cleanupOnError } from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   POST /api/soil/analyze
router.post('/analyze', cleanupOnError, uploadSingle('soilImage'), analyzeSoilFertility);

// @route   GET /api/soil
router.get('/', getSoilAnalyses);

// @route   GET /api/soil/stats
router.get('/stats', getSoilStats);

// @route   GET /api/soil/:id/image
router.get('/:id/image', getSoilImage);

// @route   GET /api/soil/:id
router.get('/:id', getSoilAnalysis);

// @route   DELETE /api/soil/:id
router.delete('/:id', deleteSoilAnalysis);

export default router;
