'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { ExportService } from '@/lib/exportService';
import { DiseaseAnalysis, SoilAnalysis } from '@/types';
import toast from 'react-hot-toast';

type ReportType = "all" | "disease" | "soil";
type Report = (DiseaseAnalysis | SoilAnalysis) & { type: "disease" | "soil" };

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[];
  filter: ReportType;
  searchTerm: string;
}

export default function ExportModal({ isOpen, onClose, reports, filter, searchTerm }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const exportOptions = ExportService.getExportOptions(reports, filter);

  const handleExport = async (format: string) => {
    if (reports.length === 0) {
      toast.error('No reports to export');
      return;
    }

    setIsExporting(true);
    setSelectedFormat(format);

    try {
      switch (format) {
        case 'pdf':
          ExportService.exportToPDF(reports, filter, searchTerm);
          toast.success('PDF exported successfully!');
          break;
        case 'excel':
          ExportService.exportToExcel(reports, filter, searchTerm);
          toast.success('Excel file exported successfully!');
          break;
        case 'csv':
          ExportService.exportToCSV(reports, filter, searchTerm);
          toast.success('CSV file exported successfully!');
          break;
        default:
          toast.error('Unsupported export format');
      }
      
      // Close modal after successful export
      setTimeout(() => {
        onClose();
        setIsExporting(false);
        setSelectedFormat(null);
      }, 1000);
      
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
      setIsExporting(false);
      setSelectedFormat(null);
    }
  };

  return (
    <Transition.Root show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <DocumentArrowDownIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Export Reports
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Choose a format to export your {filter === 'all' ? 'reports' : filter} analysis data.
                      </p>
                      {reports.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Exporting {reports.length} report{reports.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {reports.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-gray-400 mb-2">
                        <DocumentArrowDownIcon className="h-12 w-12 mx-auto" />
                      </div>
                      <p className="text-gray-500">No reports available for export</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {exportOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleExport(option.id)}
                          disabled={isExporting}
                          className={`w-full p-4 border rounded-lg text-left transition-all duration-200 ${
                            isExporting && selectedFormat === option.id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                          } ${isExporting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{option.icon}</span>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {option.label}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                            {isExporting && selectedFormat === option.id && (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                                <span className="text-sm text-green-600">Exporting...</span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-500 sm:ml-3 sm:w-auto"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
