"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { soilAPI } from "@/lib/api";
import { SoilAnalysis } from "@/types";
import ImageUpload from "@/components/ImageUpload";
import LoadingSpinner from "@/components/LoadingSpinner";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import {
  getFertilityLevelColor,
  getSeverityColor,
  getPriorityColor,
  getConfidenceColor,
  formatDateTime,
  capitalizeFirst,
  getApiErrorMessage,
} from "@/lib/utils";
import {
  BeakerIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface SoilForm {
  location?: string;
}

export default function SoilAnalysisPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SoilAnalysis | null>(null);

  const { register, handleSubmit, reset } = useForm<SoilForm>();

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setAnalysis(null);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setAnalysis(null);
  };

  const onSubmit = async (data: SoilForm) => {
    if (!selectedImage) {
      toast.error("Please select an image to analyze");
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("soilImage", selectedImage);
      if (data.location) {
        formData.append("location", JSON.stringify({ address: data.location }));
      }

      const response = await soilAPI.analyze(formData);
      setAnalysis(response.data.data);
      toast.success("Soil analysis completed successfully!");
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

  const getNutrientColor = (level: string) => {
    switch (level) {
      case "adequate":
        return "text-green-600 bg-green-100";
      case "excess":
        return "text-blue-600 bg-blue-100";
      case "deficient":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Soil Fertility Analysis
        </h1>
        <p className="mt-2 text-gray-600">
          Upload a photo of your soil to analyze fertility and get crop
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
              label="Soil Image"
              description="Upload a clear photo of the soil sample (PNG, JPG, GIF up to 10MB)"
              disabled={isAnalyzing}
            />

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
                  "Analyze Soil"
                )}
              </button>
            </div>
          </form>

          {isAnalyzing && (
            <div className="mt-8 text-center">
              <LoadingSpinner
                size="lg"
                text="Analyzing your soil sample with AI..."
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
                  Soil Analysis Results
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

            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getFertilityLevelColor(
                    analysis.fertilityLevel
                  )}`}
                >
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Analyzed Soil Sample
                </h3>
                <ImagePlaceholder
                  type="soil"
                  className="w-full h-64 rounded-lg border"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Soil Composition
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Organic Matter
                    </dt>
                    <dd className="text-sm text-gray-900 capitalize">
                      {analysis.composition.organicMatter}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Moisture
                    </dt>
                    <dd className="text-sm text-gray-900 capitalize">
                      {analysis.composition.moisture}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Texture
                    </dt>
                    <dd className="text-sm text-gray-900 capitalize">
                      {analysis.composition.texture}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Color</dt>
                    <dd className="text-sm text-gray-900">
                      {analysis.composition.color}
                    </dd>
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
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getNutrientColor(
                    analysis.nutrients.nitrogen
                  )}`}
                >
                  {capitalizeFirst(analysis.nutrients.nitrogen)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Nitrogen (N)</p>
              </div>
              <div className="text-center">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getNutrientColor(
                    analysis.nutrients.phosphorus
                  )}`}
                >
                  {capitalizeFirst(analysis.nutrients.phosphorus)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Phosphorus (P)</p>
              </div>
              <div className="text-center">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getNutrientColor(
                    analysis.nutrients.potassium
                  )}`}
                >
                  {capitalizeFirst(analysis.nutrients.potassium)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Potassium (K)</p>
              </div>
              <div className="text-center">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getNutrientColor(
                    analysis.nutrients.ph
                  )}`}
                >
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
                  <div
                    key={index}
                    className="border border-red-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {issue.type}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(
                          issue.severity
                        )}`}
                      >
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
                  <div
                    key={index}
                    className="border border-green-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {crop.cropName}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getFertilityLevelColor(
                          crop.suitability
                        )}`}
                      >
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
                  <div
                    key={index}
                    className="border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {rec.type}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
                          rec.priority
                        )}`}
                      >
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.action}</p>
                    <p className="text-xs text-gray-500">
                      <strong>Expected improvement:</strong>{" "}
                      {rec.expectedImprovement}
                    </p>
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
