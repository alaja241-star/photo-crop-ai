import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import SoilAnalysis from '../models/SoilAnalysis.js';
import aiService from '../services/aiService.js';
import { deleteFile } from '../middleware/upload.js';

/**
 * @desc    Analyze soil fertility from uploaded image
 * @route   POST /api/soil/analyze
 * @access  Private
 */
export const analyzeSoilFertility = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();

  try {
    const { location } = req.body;
    if (!req.file) {
      res.status(400).json({ success: false, error: 'Please upload an image file.' });
      return;
    }
    const imagePath = req.file.path;

    // Analyze image with AI first - only save to DB if successful
    const aiResult = await aiService.analyzeSoilFertility(
      imagePath,
      location ? JSON.parse(location) : null
    );

    // Create analysis record with AI results - only save if AI was successful
    const analysis = new SoilAnalysis({
      user: req.user!.id,
      location: location ? JSON.parse(location) : undefined,
      image: {
        data: fs.readFileSync(imagePath),
        contentType: req.file.mimetype,
        size: req.file.size,
      },
      // Structured output (responseSchema) guarantees valid enum values,
      // so AI results are stored directly without post-hoc coercion.
      soilType: aiResult.soilType,
      fertilityLevel: aiResult.fertilityLevel,
      confidence: aiResult.confidence,
      composition: aiResult.composition,
      nutrients: aiResult.nutrients,
      issues: aiResult.issues,
      suitableCrops: aiResult.suitableCrops,
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
    analysis.imageUrl = `/api/soil/${analysis._id}/image`;

    // Save to database only after successful AI analysis
    await analysis.save();

    // Delete the temp upload from disk; the bytes now live in Mongo.
    deleteFile(imagePath);

    // Omit the raw image bytes from the response (fetched separately via the
    // image endpoint); `select: false` only affects queries, not this doc.
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
 * @desc    Get user's soil analyses with pagination
 * @route   GET /api/soil
 * @access  Private
 */
export const getSoilAnalyses = async (
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

    if (req.query.soilType) {
      filter.soilType = req.query.soilType;
    }

    if (req.query.fertilityLevel) {
      filter.fertilityLevel = req.query.fertilityLevel;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Get analyses with pagination
    const analyses = await SoilAnalysis.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SoilAnalysis.countDocuments(filter);

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
 * @desc    Get specific soil analysis
 * @route   GET /api/soil/:id
 * @access  Private
 */
export const getSoilAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const analysis = await SoilAnalysis.findOne({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!analysis) {
      res.status(404).json({ success: false, error: 'Soil analysis not found' });
      return;
    }

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete soil analysis
 * @route   DELETE /api/soil/:id
 * @access  Private
 */
export const deleteSoilAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const analysis = await SoilAnalysis.findOne({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!analysis) {
      res.status(404).json({ success: false, error: 'Soil analysis not found' });
      return;
    }

    // Delete the analysis record (no need to delete image file as it's already deleted)
    await SoilAnalysis.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Soil analysis deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's soil analysis statistics
 * @route   GET /api/soil/stats
 * @access  Private
 */
export const getSoilStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await SoilAnalysis.getUserStats(req.user!.id);

    // Get recent analyses
    const recentAnalyses = await SoilAnalysis.find({ user: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('soilType fertilityLevel confidence createdAt')
      .lean();

    // Get soil type distribution
    const soilTypeDistribution = await SoilAnalysis.aggregate([
      { $match: { user: req.user!._id } },
      { $group: { _id: '$soilType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get fertility level distribution
    const fertilityDistribution = await SoilAnalysis.aggregate([
      { $match: { user: req.user!._id } },
      { $group: { _id: '$fertilityLevel', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: { ...stats, recentAnalyses, soilTypeDistribution, fertilityDistribution },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Stream the stored image for a soil analysis
 * @route   GET /api/soil/:id/image
 * @access  Private
 */
export const getSoilImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const analysis = await SoilAnalysis.findOne({
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
