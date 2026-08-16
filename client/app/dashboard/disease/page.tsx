"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { diseaseAPI } from "@/lib/api";
import { DiseaseAnalysis } from "@/types";
import ImageUpload from "@/components/ImageUpload";
import LoadingSpinner from "@/components/LoadingSpinner";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import {
  getHealthStatusColor,
  getSeverityColor,
  getPriorityColor,
  getConfidenceColor,
  formatDateTime,
  getApiErrorMessage,
} from "@/lib/utils";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface DiseaseForm {
  cropType: string;
  location?: string;
}

export default function DiseaseDetectionPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DiseaseAnalysis | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DiseaseForm>();

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setAnalysis(null);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setAnalysis(null);
  };

  const onSubmit = async (data: DiseaseForm) => {
    if (!selectedImage) {
      toast.error("Please select an image to analyze");
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("cropImage", selectedImage);
      formData.append("cropType", data.cropType);
      if (data.location) {
        formData.append("location", JSON.stringify({ address: data.location }));
      }

      const response = await diseaseAPI.analyze(formData);
      setAnalysis(response.data.data);
      toast.success("Analysis completed successfully!");
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Analysis failed. Please try again.");
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setSelectedImage(null);
    setAnalysis(null);
    reset();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Crop Disease Detection
        </h1>
        <p className="mt-2 text-gray-600">
          Upload a photo of your crop to detect diseases and get treatment
          recommendations
        </p>
      </div>

      {!analysis ? (
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <ImageUpload
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              selectedImage={selectedImage}
              label="Crop Image"
              description="Upload a clear photo of the affected crop (PNG, JPG, GIF up to 10MB)"
              disabled={isAnalyzing}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="cropType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Crop Type
                </label>
                <input
                  {...register("cropType", {
                    required: "Crop type is required",
                  })}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="e.g., Tomato, Corn, Wheat"
                  disabled={isAnalyzing}
                />
                {errors.cropType && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.cropType.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700"
                >
                  Location (Optional)
                </label>
                <input
                  {...register("location")}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="e.g., Farm location or region"
                  disabled={isAnalyzing}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!selectedImage || isAnalyzing}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Crop"
                )}
              </button>
            </div>
          </form>

          {isAnalyzing && (
            <div className="mt-8 text-center">
              <LoadingSpinner
                size="lg"
                text="Analyzing your crop image with AI..."
              />
              <p className="mt-4 text-sm text-gray-500">
                This may take a few moments. Please don&apos;t close this page.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Analysis Results Header */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Analysis Results
                </h2>
                <p className="text-sm text-gray-500">
                  Analyzed on {formatDateTime(analysis.createdAt)}
                </p>
              </div>
              <button
                onClick={handleNewAnalysis}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                New Analysis
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthStatusColor(
                    analysis.healthStatus
                  )}`}
                >
                  {analysis.healthStatus === "healthy" ? (
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  )}
                  {analysis.healthStatus.replace("_", " ").toUpperCase()}
                </div>
                <p className="text-xs text-gray-500 mt-1">Health Status</p>
              </div>

              <div className="text-center">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(
                    analysis.confidence
                  )}`}
                >
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
            </div>
          </div>

          {/* Image and Basic Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Analyzed Image
                </h3>
                <ImagePlaceholder
                  type="crop"
                  className="w-full h-64 rounded-lg border"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Crop Information
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Crop Type
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {analysis.cropType || "Not specified"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Disease Detected
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {analysis.diseaseDetected ? "Yes" : "No"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Analysis Time
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {analysis.metadata.analysisTime}ms
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
                  <div
                    key={index}
                    className="border border-red-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {disease.name}
                      </h4>
                      <div className="flex space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(
                            disease.severity
                          )}`}
                        >
                          {disease.severity.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(
                            disease.confidence
                          )}`}
                        >
                          {disease.confidence}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {disease.description}
                    </p>

                    {disease.symptoms.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">
                          Symptoms:
                        </h5>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {disease.symptoms.map((symptom, idx) => (
                            <li key={idx}>{symptom}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {disease.causes.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">
                          Causes:
                        </h5>
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
                  <div
                    key={index}
                    className="border border-orange-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{pest.name}</h4>
                      <div className="flex space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(
                            pest.severity
                          )}`}
                        >
                          {pest.severity.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(
                            pest.confidence
                          )}`}
                        >
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
                  <div
                    key={index}
                    className="border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {rec.type.replace("_", " ")}
                      </h4>
                      <div className="flex space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
                            rec.priority
                          )}`}
                        >
                          {rec.priority.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {rec.timeframe.replace("_", " ")}
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Additional Notes
              </h3>
              <p className="text-sm text-gray-600">
                {analysis.additionalNotes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
