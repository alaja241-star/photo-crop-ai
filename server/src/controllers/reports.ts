import type { Request, Response, NextFunction } from 'express';
import DiseaseAnalysis from '../models/DiseaseAnalysis.js';
import SoilAnalysis from '../models/SoilAnalysis.js';
import CropRecommendation from '../models/CropRecommendation.js';

const toTime = (value: unknown): number => new Date(value as string | number | Date).getTime();

/**
 * @desc    Get user dashboard with all statistics
 * @route   GET /api/reports/dashboard
 * @access  Private
 */
export const getUserDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get statistics from all models
    const [diseaseStats, soilStats, cropStats] = await Promise.all([
      DiseaseAnalysis.getUserStats(req.user!.id),
      SoilAnalysis.getUserStats(req.user!.id),
      CropRecommendation.getUserStats(req.user!.id),
    ]);

    // Get recent activities
    const [recentDiseaseAnalyses, recentSoilAnalyses, recentRecommendations] = await Promise.all([
      DiseaseAnalysis.find({ user: req.user!.id })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('cropType diseaseDetected healthStatus confidence createdAt imageUrl')
        .lean(),
      SoilAnalysis.find({ user: req.user!.id })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('soilType fertilityLevel confidence createdAt imageUrl')
        .lean(),
      CropRecommendation.find({ user: req.user!.id })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('location recommendations.length createdAt')
        .lean(),
    ]);

    // Combine recent activities
    const recentActivities = [
      ...recentDiseaseAnalyses.map((item) => ({
        ...item,
        type: 'disease',
        title: `Disease Analysis - ${item.cropType || 'Unknown Crop'}`,
        status: item.diseaseDetected ? 'Disease Detected' : 'Healthy',
      })),
      ...recentSoilAnalyses.map((item) => ({
        ...item,
        type: 'soil',
        title: `Soil Analysis - ${item.soilType} Soil`,
        status: item.fertilityLevel,
      })),
      ...recentRecommendations.map((item) => ({
        ...item,
        type: 'recommendation',
        title: `Crop Recommendations - ${item.location?.city || 'Unknown Location'}`,
        status: `${item.recommendations?.length || 0} crops recommended`,
      })),
    ]
      .sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt))
      .slice(0, 10);

    // Calculate overall health score
    const totalAnalyses = diseaseStats.totalAnalyses + soilStats.totalAnalyses;
    const healthyPlants = diseaseStats.healthyPlants;
    const goodSoil = soilStats.excellentSoil + soilStats.goodSoil;
    const overallHealthScore =
      totalAnalyses > 0 ? Math.round(((healthyPlants + goodSoil) / totalAnalyses) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalAnalyses,
          diseaseAnalyses: diseaseStats.totalAnalyses,
          soilAnalyses: soilStats.totalAnalyses,
          cropRecommendations: cropStats.totalRecommendations,
          overallHealthScore,
        },
        diseaseStats,
        soilStats,
        cropStats,
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all user reports (disease + soil analyses)
 * @route   GET /api/reports
 * @access  Private
 */
export const getUserReports = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const type = req.query.type as string | undefined; // 'disease', 'soil', or undefined for all

    let reports: Array<Record<string, unknown>> = [];
    let total = 0;

    if (!type || type === 'disease') {
      const diseaseAnalyses = await DiseaseAnalysis.find({ user: req.user!.id })
        .sort({ createdAt: -1 })
        .skip(type === 'disease' ? skip : 0)
        .limit(type === 'disease' ? limit : limit / 2)
        .lean();

      reports.push(
        ...diseaseAnalyses.map((item) => ({ ...item, id: item._id, type: 'disease' }))
      );

      if (type === 'disease') {
        total = await DiseaseAnalysis.countDocuments({ user: req.user!.id });
      }
    }

    if (!type || type === 'soil') {
      const soilAnalyses = await SoilAnalysis.find({ user: req.user!.id })
        .sort({ createdAt: -1 })
        .skip(type === 'soil' ? skip : 0)
        .limit(type === 'soil' ? limit : limit / 2)
        .lean();

      reports.push(...soilAnalyses.map((item) => ({ ...item, id: item._id, type: 'soil' })));

      if (type === 'soil') {
        total = await SoilAnalysis.countDocuments({ user: req.user!.id });
      }
    }

    if (!type) {
      const [diseaseCount, soilCount] = await Promise.all([
        DiseaseAnalysis.countDocuments({ user: req.user!.id }),
        SoilAnalysis.countDocuments({ user: req.user!.id }),
      ]);
      total = diseaseCount + soilCount;
    }

    // Sort combined results by creation date
    reports.sort((a, b) => toTime(b.createdAt) - toTime(a.createdAt));

    // Apply pagination for combined results
    if (!type) {
      reports = reports.slice(skip, skip + limit);
    }

    res.status(200).json({
      success: true,
      data: reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get specific report by type and id
 * @route   GET /api/reports/:type/:id
 * @access  Private
 */
export const getReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, id } = req.params;
    let report;

    if (type === 'disease') {
      report = await DiseaseAnalysis.findOne({ _id: id, user: req.user!.id });
    } else if (type === 'soil') {
      report = await SoilAnalysis.findOne({ _id: id, user: req.user!.id });
    } else {
      res.status(400).json({ success: false, error: 'Invalid report type. Must be "disease" or "soil"' });
      return;
    }

    if (!report) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }

    res.status(200).json({ success: true, data: { ...report.toObject(), type } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete specific report by type and id
 * @route   DELETE /api/reports/:type/:id
 * @access  Private
 */
export const deleteReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const type = req.params.type as string;
    const id = req.params.id as string;

    // Validate ID format
    if (!id || id === 'undefined' || id === 'null') {
      res.status(400).json({ success: false, error: 'Invalid report ID' });
      return;
    }

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ success: false, error: 'Invalid report ID format' });
      return;
    }

    let result;

    if (type === 'disease') {
      result = await DiseaseAnalysis.findOneAndDelete({ _id: id, user: req.user!.id });
    } else if (type === 'soil') {
      result = await SoilAnalysis.findOneAndDelete({ _id: id, user: req.user!.id });
    } else {
      res.status(400).json({ success: false, error: 'Invalid report type. Must be "disease" or "soil"' });
      return;
    }

    if (!result) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's crop recommendations
 * @route   GET /api/reports/crop-recommendations
 * @access  Private
 */
export const getCropRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const recommendations = await CropRecommendation.find({ user: req.user!.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await CropRecommendation.countDocuments({ user: req.user!.id });

    res.status(200).json({
      success: true,
      data: recommendations,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get specific crop recommendation
 * @route   GET /api/reports/crop-recommendations/:id
 * @access  Private
 */
export const getCropRecommendation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recommendation = await CropRecommendation.findOne({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!recommendation) {
      res.status(404).json({ success: false, error: 'Crop recommendation not found' });
      return;
    }

    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete crop recommendation
 * @route   DELETE /api/reports/crop-recommendations/:id
 * @access  Private
 */
export const deleteCropRecommendation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recommendation = await CropRecommendation.findOneAndDelete({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!recommendation) {
      res.status(404).json({ success: false, error: 'Crop recommendation not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Crop recommendation deleted successfully' });
  } catch (error) {
    next(error);
  }
};
