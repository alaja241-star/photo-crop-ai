'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { reportsAPI } from '@/lib/api';
import { DashboardStats } from '@/types';
import { formatDate, getHealthStatusColor, getFertilityLevelColor } from '@/lib/utils';
import {
  CameraIcon,
  BeakerIcon,
  CloudIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await reportsAPI.getDashboard();
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const quickActions = [
    {
      name: 'Analyze Crop Disease',
      description: 'Upload a photo to detect diseases',
      href: '/dashboard/disease',
      icon: CameraIcon,
      color: 'bg-red-500',
    },
    {
      name: 'Test Soil Quality',
      description: 'Analyze soil fertility and composition',
      href: '/dashboard/soil',
      icon: BeakerIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Weather & Crops',
      description: 'Get crop recommendations',
      href: '/dashboard/weather',
      icon: CloudIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'View Reports',
      description: 'Access all your analysis reports',
      href: '/dashboard/reports',
      icon: ChartBarIcon,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="mt-2 text-green-100">
          Here&apos;s what&apos;s happening with your farm today
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Analyses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.overview.totalAnalyses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CameraIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Disease Analyses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.overview.diseaseAnalyses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BeakerIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Soil Analyses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.overview.soilAnalyses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Health Score
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.overview.overallHealthScore}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div>
                <span className={`rounded-lg inline-flex p-3 ${action.color} text-white`}>
                  <action.icon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {action.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      {stats && stats.recentActivities.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {stats.recentActivities.slice(0, 5).map((activity) => (
                <li key={activity.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {activity.type === 'disease' && (
                            <CameraIcon className="h-5 w-5 text-red-400" />
                          )}
                          {activity.type === 'soil' && (
                            <BeakerIcon className="h-5 w-5 text-yellow-400" />
                          )}
                          {activity.type === 'recommendation' && (
                            <CloudIcon className="h-5 w-5 text-blue-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(activity.createdAt)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Health Insights */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Disease Detection Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Analyses:</span>
                <span className="text-sm font-medium">{stats.diseaseStats.totalAnalyses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Diseases Detected:</span>
                <span className="text-sm font-medium text-red-600">
                  {stats.diseaseStats.diseasesDetected}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Healthy Plants:</span>
                <span className="text-sm font-medium text-green-600">
                  {stats.diseaseStats.healthyPlants}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Confidence:</span>
                <span className="text-sm font-medium">
                  {Math.round(stats.diseaseStats.avgConfidence)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Soil Analysis Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Analyses:</span>
                <span className="text-sm font-medium">{stats.soilStats.totalAnalyses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Excellent Soil:</span>
                <span className="text-sm font-medium text-green-600">
                  {stats.soilStats.excellentSoil}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Good Soil:</span>
                <span className="text-sm font-medium text-blue-600">
                  {stats.soilStats.goodSoil}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Confidence:</span>
                <span className="text-sm font-medium">
                  {Math.round(stats.soilStats.avgConfidence)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
