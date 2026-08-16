"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  HomeIcon,
  CameraIcon,
  BeakerIcon,
  CloudIcon,
  DocumentTextIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Disease Detection", href: "/dashboard/disease", icon: CameraIcon },
  { name: "Soil Analysis", href: "/dashboard/soil", icon: BeakerIcon },
  { name: "Weather & Crops", href: "/dashboard/weather", icon: CloudIcon },
  { name: "Reports", href: "/dashboard/reports", icon: DocumentTextIcon },
  { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
];

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`relative z-50 lg:hidden ${sidebarOpen ? "" : "hidden"}`}>
        <div
          className="fixed inset-0 bg-gray-900/80"
          onClick={() => setSidebarOpen(false)}
        />

        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
              <div className="flex h-16 shrink-0 items-center">
                <h1 className="text-xl font-bold text-green-600">🌱 AgriAI</h1>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          pathname.startsWith(item.href + "/");
                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                                isActive
                                  ? "bg-green-50 text-green-700"
                                  : "text-gray-700 hover:text-green-700 hover:bg-green-50"
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <item.icon
                                className={`h-6 w-6 shrink-0 ${
                                  isActive
                                    ? "text-green-700"
                                    : "text-gray-400 group-hover:text-green-700"
                                }`}
                              />
                              {item.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                  <li className="-mx-6 mt-auto">
                    <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="sr-only">Your profile</span>
                      <span>{user?.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-x-3 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
                    >
                      <ArrowRightOnRectangleIcon className="h-6 w-6 text-gray-400" />
                      Sign out
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-green-600">🌱 AgriAI</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                            isActive
                              ? "bg-green-50 text-green-700"
                              : "text-gray-700 hover:text-green-700 hover:bg-green-50"
                          }`}
                        >
                          <item.icon
                            className={`h-6 w-6 shrink-0 ${
                              isActive
                                ? "text-green-700"
                                : "text-gray-400 group-hover:text-green-700"
                            }`}
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="-mx-6 mt-auto">
                <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="sr-only">Your profile</span>
                  <span>{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-x-3 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6 text-gray-400" />
                  Sign out
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
          <h1 className="text-lg font-bold text-green-600">🌱 AgriAI</h1>
        </div>
      </div>
    </>
  );
}
