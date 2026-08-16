'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { soilAPI } from '@/lib/api';
import { SoilAnalysis } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnalysisImage from '@/components/AnalysisImage';
import { 
  getFertilityLevelColor, 
  getSeverityColor, 
  getPriorityColor, 
  getConfidenceColor,
  formatDateTime,
  capitalizeFirst 
} from '@/lib/utils';
import {
  ArrowLeftIcon,
  BeakerIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import SingleReportExportModal from '@/components/SingleReportExportModal';

export default function SoilAnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<SoilAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await soilAPI.getAnalysis(params.id as string);
        setAnalysis(response.data.data);
      } catch (error) {
        console.error('Failed to fetch analysis:', error);
        toast.error('Failed to load analysis details');
        router.push('/dashboard/reports');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAnalysis();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading analysis details..." />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Analysis not found</h2>
        <p className="mt-2 text-gray-600">The requested analysis could not be found.</p>
        <Link
          href="/dashboard/reports"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Reports
        </Link>
      </div>
    );
  }

  const getNutrientColor = (level: string) => {
    switch (level) {
      case 'adequate':
        return 'text-green-600 bg-green-100';
      case 'excess':
        return 'text-blue-600 bg-blue-100';
      case 'deficient':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Reports
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Export Report
          </button>
          <div className="text-sm text-gray-500">
            Analyzed on {formatDateTime(analysis.createdAt)}
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Soil Analysis Details</h1>
        <p className="mt-2 text-gray-600">
          Detailed results from AI-powered soil fertility analysis
        </p>
      </div>

      {/* Analysis Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Analysis Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getFertilityLevelColor(analysis.fertilityLevel)}`}>
              <BeakerIcon className="h-4 w-4 mr-1" />
              {capitalizeFirst(analysis.fertilityLevel)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Fertility Level</p>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 capitalize">
              {analysis.soilType}
            </div>
            <p className="text-xs text-gray-500 mt-1">Soil Type</p>
          </div>

          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(analysis.confidence)}`}>
              {analysis.confidence}% Confidence
            </div>
            <p className="text-xs text-gray-500 mt-1">AI Confidence</p>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {analysis.issues.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Issues Found</p>
          </div>
        </div>
      </div>

      {/* Image and Basic Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Analyzed Soil Sample</h3>
            <AnalysisImage
              type="soil"
              imageUrl={analysis.imageUrl}
              className="w-full h-64 rounded-lg border"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Soil Composition</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Organic Matter</dt>
                <dd className="text-sm text-gray-900 capitalize">{analysis.composition.organicMatter}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Moisture</dt>
                <dd className="text-sm text-gray-900 capitalize">{analysis.composition.moisture}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Texture</dt>
                <dd className="text-sm text-gray-900 capitalize">{analysis.composition.texture}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Color</dt>
                <dd className="text-sm text-gray-900">{analysis.composition.color}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900 capitalize">{analysis.status}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Nutrient Analysis */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <BeakerIcon className="h-5 w-5 text-blue-500 mr-2" />
          Nutrient Analysis
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getNutrientColor(analysis.nutrients.nitrogen)}`}>
              {capitalizeFirst(analysis.nutrients.nitrogen)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Nitrogen (N)</p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getNutrientColor(analysis.nutrients.phosphorus)}`}>
              {capitalizeFirst(analysis.nutrients.phosphorus)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Phosphorus (P)</p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getNutrientColor(analysis.nutrients.potassium)}`}>
              {capitalizeFirst(analysis.nutrients.potassium)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Potassium (K)</p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getNutrientColor(analysis.nutrients.ph)}`}>
              {capitalizeFirst(analysis.nutrients.ph)}
            </div>
            <p className="text-xs text-gray-500 mt-1">pH Level</p>
          </div>
        </div>
      </div>

      {/* Issues */}
      {analysis.issues.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            Soil Issues ({analysis.issues.length})
          </h3>
          <div className="space-y-4">
            {analysis.issues.map((issue, index) => (
              <div key={index} className="border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 capitalize">{issue.type}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(issue.severity)}`}>
                    {issue.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{issue.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suitable Crops */}
      {analysis.suitableCrops.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            Suitable Crops ({analysis.suitableCrops.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.suitableCrops.map((crop, index) => (
              <div key={index} className="border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{crop.cropName}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getFertilityLevelColor(crop.suitability)}`}>
                    {crop.suitability.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{crop.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
            Improvement Recommendations ({analysis.recommendations.length})
          </h3>
          <div className="space-y-4">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 capitalize">{rec.type}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(rec.priority)}`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rec.action}</p>
                <p className="text-xs text-gray-500">
                  <strong>Expected improvement:</strong> {rec.expectedImprovement}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Notes */}
      {analysis.additionalNotes && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
          <p className="text-sm text-gray-600">{analysis.additionalNotes}</p>
        </div>
      )}

      {/* Export Modal */}
      <SingleReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        report={{ ...analysis, type: 'soil' }}
      />
    </div>
  );
}
