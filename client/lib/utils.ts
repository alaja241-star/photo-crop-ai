import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Extract a human-readable message from an unknown error, preferring the
 * server's `{ error }` payload (axios error shape), then Error.message.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) {
      return response.data.error;
    }
    const message = (error as { message?: string }).message;
    if (message) {
      return message;
    }
  }
  return fallback;
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getHealthStatusColor(status: string) {
  switch (status) {
    case "healthy":
      return "text-green-800 bg-green-200 border border-green-300";
    case "mild_issues":
      return "text-yellow-800 bg-yellow-200 border border-yellow-300";
    case "moderate_issues":
      return "text-orange-800 bg-orange-200 border border-orange-300";
    case "severe_issues":
      return "text-red-800 bg-red-200 border border-red-300";
    default:
      return "text-gray-800 bg-gray-200 border border-gray-300";
  }
}

export function getFertilityLevelColor(level: string) {
  switch (level) {
    case "excellent":
      return "text-green-800 bg-green-200 border border-green-300";
    case "good":
      return "text-blue-800 bg-blue-200 border border-blue-300";
    case "fair":
      return "text-yellow-800 bg-yellow-200 border border-yellow-300";
    case "poor":
      return "text-red-800 bg-red-200 border border-red-300";
    default:
      return "text-gray-800 bg-gray-200 border border-gray-300";
  }
}

export function getSeverityColor(severity: string) {
  switch (severity) {
    case "low":
      return "text-green-800 bg-green-200 border border-green-300";
    case "medium":
      return "text-yellow-800 bg-yellow-200 border border-yellow-300";
    case "high":
      return "text-red-800 bg-red-200 border border-red-300";
    default:
      return "text-gray-800 bg-gray-200 border border-gray-300";
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case "low":
      return "text-blue-800 bg-blue-200 border border-blue-300";
    case "medium":
      return "text-yellow-800 bg-yellow-200 border border-yellow-300";
    case "high":
      return "text-red-800 bg-red-200 border border-red-300";
    default:
      return "text-gray-800 bg-gray-200 border border-gray-300";
  }
}

export function getConfidenceColor(confidence: number) {
  if (confidence >= 80)
    return "text-green-800 bg-green-200 border border-green-300";
  if (confidence >= 60)
    return "text-yellow-800 bg-yellow-200 border border-yellow-300";
  if (confidence >= 40)
    return "text-orange-800 bg-orange-200 border border-orange-300";
  return "text-red-800 bg-red-200 border border-red-300";
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatTemperature(
  temp: number,
  unit: "metric" | "imperial" = "metric"
) {
  if (unit === "imperial") {
    return `${Math.round((temp * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(temp)}°C`;
}

export function formatWindSpeed(
  speed: number,
  unit: "metric" | "imperial" = "metric"
) {
  if (unit === "imperial") {
    return `${Math.round(speed * 2.237)} mph`;
  }
  return `${Math.round(speed * 3.6)} km/h`;
}

export function getWeatherIcon(condition: string) {
  const iconMap: { [key: string]: string } = {
    "clear sky": "☀️",
    "few clouds": "🌤️",
    "scattered clouds": "⛅",
    "broken clouds": "☁️",
    "shower rain": "🌦️",
    rain: "🌧️",
    thunderstorm: "⛈️",
    snow: "🌨️",
    mist: "🌫️",
  };

  return iconMap[condition.toLowerCase()] || "🌤️";
}

export function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password: string) {
  return password.length >= 6;
}

export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
