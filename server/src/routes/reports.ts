import express from 'express';
import {
  getUserReports,
  getReport,
  deleteReport,
  getUserDashboard,
  getCropRecommendations,
  getCropRecommendation,
  deleteCropRecommendation,
} from '../controllers/reports.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/reports/dashboard
router.get('/dashboard', getUserDashboard);

// @route   GET /api/reports
router.get('/', getUserReports);

// @route   POST /api/reports/export/pdf
// @desc    Export reports to PDF
// @access  Private
// router.post('/export/pdf', exportReportsToPDF);

// @route   POST /api/reports/export/excel
// @desc    Export reports to Excel
// @access  Private
// router.post('/export/excel', exportReportsToExcel);

// @route   GET /api/reports/:type/:id
router.get('/:type/:id', getReport);

// @route   DELETE /api/reports/:type/:id
router.delete('/:type/:id', deleteReport);

// @route   GET /api/reports/crop-recommendations
router.get('/crop-recommendations', getCropRecommendations);

// @route   GET /api/reports/crop-recommendations/:id
router.get('/crop-recommendations/:id', getCropRecommendation);

// @route   DELETE /api/reports/crop-recommendations/:id
router.delete('/crop-recommendations/:id', deleteCropRecommendation);

export default router;
