"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { reportsAPI } from "@/lib/api";
import { DiseaseAnalysis, SoilAnalysis } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import {
  formatDateTime,
  getHealthStatusColor,
  getFertilityLevelColor,
  getConfidenceColor,
  truncateText,
} from "@/lib/utils";
import {
  CameraIcon,
  BeakerIcon,
  EyeIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import ExportModal from "@/components/ExportModal";

type ReportType = "all" | "disease" | "soil";
type Report = (DiseaseAnalysis | SoilAnalysis) & {
  type: "disease" | "soil";
  // The API may return the raw Mongo `_id` alongside the normalized `id`.
  _id?: string;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReportType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filter, page]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        ...(filter !== "all" && { type: filter }),
      };

      const response = await reportsAPI.getReports(params);
      setReports(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: "disease" | "soil", id: string) => {
    if (!id || id === "undefined") {
      toast.error("Invalid report ID");
      return;
    }

    if (!confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      await reportsAPI.deleteReport(type, id);
      setReports(reports.filter((report) => report.id !== id));
      toast.success("Report deleted successfully");
    } catch (error) {
      console.error("Failed to delete report:", error);
      toast.error("Failed to delete report");
    }
  };

  const filteredReports = reports.filter((report) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    if (report.type === "disease") {
      const diseaseReport = report as DiseaseAnalysis;
      return (
        diseaseReport.cropType?.toLowerCase().includes(searchLower) ||
        diseaseReport.healthStatus.toLowerCase().includes(searchLower) ||
        diseaseReport.diseases.some((d) =>
          d.name.toLowerCase().includes(searchLower)
        )
      );
    } else {
      const soilReport = report as SoilAnalysis;
      return (
        soilReport.soilType.toLowerCase().includes(searchLower) ||
        soilReport.fertilityLevel.toLowerCase().includes(searchLower)
      );
    }
  });

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading reports..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analysis Reports</h1>
        <p className="mt-2 text-gray-600">
          View and manage your crop disease and soil analysis history
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-4">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <div className="flex space-x-2">
              {(["all", "disease", "soil"] as ReportType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilter(type);
                    setPage(1);
                  }}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filter === type
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type === "all"
                    ? "All Reports"
                    : `${
                        type.charAt(0).toUpperCase() + type.slice(1)
                      } Analysis`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Export Button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsExportModalOpen(true)}
              disabled={reports.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            {filter === "disease" ? (
              <CameraIcon className="h-12 w-12 mx-auto" />
            ) : filter === "soil" ? (
              <BeakerIcon className="h-12 w-12 mx-auto" />
            ) : (
              <div className="flex justify-center space-x-2">
                <CameraIcon className="h-12 w-12" />
                <BeakerIcon className="h-12 w-12" />
              </div>
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No reports found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? "No reports match your search criteria."
              : "Start by analyzing your crops or soil to see reports here."}
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/dashboard/disease"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <CameraIcon className="h-4 w-4 mr-2" />
              Analyze Crop
            </Link>
            <Link
              href="/dashboard/soil"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
            >
              <BeakerIcon className="h-4 w-4 mr-2" />
              Analyze Soil
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {report.type === "disease" ? (
                        <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <CameraIcon className="h-6 w-6 text-red-600" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <BeakerIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {report.type === "disease"
                            ? "Disease Analysis"
                            : "Soil Analysis"}
                        </h3>
                        {report.type === "disease" ? (
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getHealthStatusColor(
                              (report as DiseaseAnalysis).healthStatus
                            )}`}
                          >
                            {(report as DiseaseAnalysis).healthStatus
                              .replace("_", " ")
                              .toUpperCase()}
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getFertilityLevelColor(
                              (report as SoilAnalysis).fertilityLevel
                            )}`}
                          >
                            {(
                              report as SoilAnalysis
                            ).fertilityLevel.toUpperCase()}
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(
                            report.confidence
                          )}`}
                        >
                          {report.confidence}% confidence
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        {report.type === "disease" ? (
                          <div>
                            <p>
                              <strong>Crop:</strong>{" "}
                              {(report as DiseaseAnalysis).cropType ||
                                "Not specified"}
                            </p>
                            <p>
                              <strong>Issues:</strong>{" "}
                              {(report as DiseaseAnalysis).diseases.length +
                                (report as DiseaseAnalysis).pests.length}{" "}
                              detected
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p>
                              <strong>Soil Type:</strong>{" "}
                              {(report as SoilAnalysis).soilType}
                            </p>
                            <p>
                              <strong>Issues:</strong>{" "}
                              {(report as SoilAnalysis).issues.length} found
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        Analyzed on {formatDateTime(report.createdAt)}
                      </div>

                      {report.additionalNotes && (
                        <p className="text-sm text-gray-600 mt-2">
                          {truncateText(report.additionalNotes, 100)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/${report.type}/${
                        report.id || report._id
                      }`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </Link>
                    <button
                      onClick={() =>
                        handleDelete(
                          report.type,
                          report.id || report._id || ""
                        )
                      }
                      className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Image Preview */}
                <div className="mt-4">
                  <ImagePlaceholder
                    type={report.type === "disease" ? "crop" : "soil"}
                    className="h-24 w-24 rounded-lg border"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{page}</span> of{" "}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        reports={filteredReports}
        filter={filter}
        searchTerm={searchTerm}
      />
    </div>
  );
}
