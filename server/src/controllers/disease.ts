import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import DiseaseAnalysis from '../models/DiseaseAnalysis.js';
import aiService from '../services/aiService.js';
import { deleteFile } from '../middleware/upload.js';

/**
 * @desc    Analyze crop disease from uploaded image
 * @route   POST /api/disease/analyze
 * @access  Private
 */
export const analyzeCropDisease = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();

  try {
    const { cropType, location } = req.body;
    if (!req.file) {
      res.status(400).json({ success: false, error: 'Please upload an image file.' });
      return;
    }
    const imagePath = req.file.path;

    // Analyze image with AI first - only save to DB if successful
    const aiResult = await aiService.analyzeCropDisease(imagePath, cropType);

    // Create analysis record with AI results - only save if AI was successful
    const analysis = new DiseaseAnalysis({
      user: req.user!.id,
      cropType,
      location: location ? JSON.parse(location) : undefined,
      image: {
        data: fs.readFileSync(imagePath),
        contentType: req.file.mimetype,
        size: req.file.size,
      },
      diseaseDetected: aiResult.diseaseDetected,
      confidence: aiResult.confidence,
      // Structured output (responseSchema) guarantees valid enum values,
      // so AI results are stored directly without post-hoc coercion.
      diseases: aiResult.diseases,
      pests: aiResult.pests,
      healthStatus: aiResult.healthStatus,
      recommendations: aiResult.recommendations,
      additionalNotes: aiResult.additionalNotes,
      status: 'completed',
      metadata: {
        imageSize: req.file.size,
        imageDimensions: { width: 0, height: 0 },
        analysisTime: Date.now() - startTime,
      },
    });

    // The document has its _id immediately; point imageUrl at the image endpoint.
    analysis.imageUrl = `/api/disease/${analysis._id}/image`;

    // Save to database only after successful AI analysis
    await analysis.save();

    // Delete the temp upload from disk; the bytes now live in Mongo.
    deleteFile(imagePath);

    // Omit the raw image bytes from the response (they are fetched separately
    // via the image endpoint); `select: false` only affects queries, not this
    // freshly-built in-memory document.
    const { image, ...data } = analysis.toObject();
    void image;
    res.status(200).json({ success: true, data });
  } catch (error) {
    // Clean up uploaded file if analysis creation fails
    if (req.file) {
      deleteFile(req.file.path);
    }
    next(error);
  }
};

/**
 * @desc    Get user's disease analyses with pagination
 * @route   GET /api/disease
 * @access  Private
 */
export const getDiseaseAnalyses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = { user: req.user!.id };

    if (req.query.diseaseDetected !== undefined) {
      filter.diseaseDetected = req.query.diseaseDetected === 'true';
    }

    if (req.query.healthStatus) {
      filter.healthStatus = req.query.healthStatus;
    }

    if (req.query.cropType) {
      filter.cropType = new RegExp(req.query.cropType as string, 'i');
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Get analyses with pagination
    const analyses = await DiseaseAnalysis.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await DiseaseAnalysis.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: analyses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get specific disease analysis
 * @route   GET /api/disease/:id
 * @access  Private
 */
export const getDiseaseAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const analysis = await DiseaseAnalysis.findOne({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!analysis) {
      res.status(404).json({ success: false, error: 'Disease analysis not found' });
      return;
    }

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete disease analysis
 * @route   DELETE /api/disease/:id
 * @access  Private
 */
export const deleteDiseaseAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const analysis = await DiseaseAnalysis.findOne({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!analysis) {
      res.status(404).json({ success: false, error: 'Disease analysis not found' });
      return;
    }

    // Delete the analysis record (no need to delete image file as it's already deleted)
    await DiseaseAnalysis.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Disease analysis deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's disease analysis statistics
 * @route   GET /api/disease/stats
 * @access  Private
 */
export const getDiseaseStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await DiseaseAnalysis.getUserStats(req.user!.id);

    // Get recent analyses
    const recentAnalyses = await DiseaseAnalysis.find({ user: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('cropType diseaseDetected healthStatus confidence createdAt')
      .lean();

    // Get crop type distribution
    const cropDistribution = await DiseaseAnalysis.aggregate([
      { $match: { user: req.user!._id } },
      { $group: { _id: '$cropType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get health status distribution
    const healthDistribution = await DiseaseAnalysis.aggregate([
      { $match: { user: req.user!._id } },
      { $group: { _id: '$healthStatus', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: { ...stats, recentAnalyses, cropDistribution, healthDistribution },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Stream the stored image for a disease analysis
 * @route   GET /api/disease/:id/image
 * @access  Private
 */
export const getDiseaseImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const analysis = await DiseaseAnalysis.findOne({
      _id: req.params.id,
      user: req.user!.id,
    }).select('+image');

    if (!analysis || !analysis.image?.data) {
      res.status(404).json({ success: false, error: 'Image not found' });
      return;
    }

    res.set('Content-Type', analysis.image.contentType);
    res.set('Cache-Control', 'private, max-age=86400');
    res.send(analysis.image.data);
  } catch (error) {
    next(error);
  }
};
