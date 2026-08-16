'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { diseaseAPI } from '@/lib/api';
import { DiseaseAnalysis } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import AnalysisImage from '@/components/AnalysisImage';
import { 
  getHealthStatusColor, 
  getSeverityColor, 
  getPriorityColor, 
  getConfidenceColor,
  formatDateTime 
} from '@/lib/utils';
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import SingleReportExportModal from '@/components/SingleReportExportModal';

export default function DiseaseAnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<DiseaseAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await diseaseAPI.getAnalysis(params.id as string);
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
        <h1 className="text-3xl font-bold text-gray-900">Disease Analysis Details</h1>
        <p className="mt-2 text-gray-600">
          Detailed results from AI-powered crop disease detection
        </p>
      </div>

      {/* Analysis Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Analysis Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthStatusColor(analysis.healthStatus)}`}>
              {analysis.healthStatus === 'healthy' ? (
                <CheckCircleIcon className="h-4 w-4 mr-1" />
              ) : (
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              )}
              {analysis.healthStatus.replace('_', ' ').toUpperCase()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Health Status</p>
          </div>

          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(analysis.confidence)}`}>
              {analysis.confidence}% Confidence
            </div>
            <p className="text-xs text-gray-500 mt-1">AI Confidence</p>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {analysis.diseases.length + analysis.pests.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Issues Detected</p>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {analysis.recommendations.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Recommendations</p>
          </div>
        </div>
      </div>

      {/* Image and Basic Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Analyzed Image</h3>
            <AnalysisImage
              type="crop"
              imageUrl={analysis.imageUrl}
              className="w-full h-64 rounded-lg border"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Crop Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Crop Type</dt>
                <dd className="text-sm text-gray-900">{analysis.cropType || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Disease Detected</dt>
                <dd className="text-sm text-gray-900">
                  {analysis.diseaseDetected ? 'Yes' : 'No'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Analysis Time</dt>
                <dd className="text-sm text-gray-900">
                  {analysis.metadata.analysisTime}ms
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900 capitalize">
                  {analysis.status}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Diseases */}
      {analysis.diseases.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            Diseases Detected ({analysis.diseases.length})
          </h3>
          <div className="space-y-4">
            {analysis.diseases.map((disease, index) => (
              <div key={index} className="border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{disease.name}</h4>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(disease.severity)}`}>
                      {disease.severity.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(disease.confidence)}`}>
                      {disease.confidence}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{disease.description}</p>
                
                {disease.symptoms.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Symptoms:</h5>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {disease.symptoms.map((symptom, idx) => (
                        <li key={idx}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {disease.causes.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Causes:</h5>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {disease.causes.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pests */}
      {analysis.pests.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2" />
            Pests Detected ({analysis.pests.length})
          </h3>
          <div className="space-y-4">
            {analysis.pests.map((pest, index) => (
              <div key={index} className="border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{pest.name}</h4>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(pest.severity)}`}>
                      {pest.severity.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(pest.confidence)}`}>
                      {pest.confidence}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{pest.description}</p>
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
            Treatment Recommendations ({analysis.recommendations.length})
          </h3>
          <div className="space-y-4">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 capitalize">{rec.type.replace('_', ' ')}</h4>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {rec.timeframe.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{rec.action}</p>
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
        report={{ ...analysis, type: 'disease' }}
      />
    </div>
  );
}
