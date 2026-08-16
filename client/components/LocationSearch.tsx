"use client";

import { useState, useRef, useEffect } from "react";
import { MapPinIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface LocationSuggestion {
  display_name: string;
  name: string;
  country: string;
  state?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  type: string;
}

interface LocationSearchProps {
  onLocationSelect: (location: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

// Geocoding service using OpenStreetMap Nominatim API
const searchLocations = async (
  query: string
): Promise<LocationSuggestion[]> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: query,
          format: "json",
          addressdetails: "1",
          limit: "8",
          countrycodes: "", // You can restrict to specific countries if needed
          "accept-language": "en",
        }),
      {
        headers: {
          "User-Agent": "AgriAI-App/1.0 (Agricultural AI Application)",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Geocoding request failed");
    }

    const results: NominatimResult[] = await response.json();

    return results.map((result) => ({
      display_name: result.display_name,
      name:
        result.address.city ||
        result.address.town ||
        result.address.village ||
        "Unknown",
      country: result.address.country || "Unknown",
      state: result.address.state,
      coordinates: {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
      },
      type: result.type,
    }));
  } catch (error) {
    console.error("Geocoding error:", error);
    return [];
  }
};

export default function LocationSearch({
  onLocationSelect,
  placeholder = "Enter city, state, or coordinates",
  disabled = false,
  className = "",
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length > 2) {
      setIsLoading(true);

      // Debounce the search to avoid too many API calls
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchLocations(query);
          setSuggestions(results);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        } catch (error) {
          console.error("Search failed:", error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300); // 300ms debounce
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const locationString = `${suggestion.name}, ${suggestion.country}`;
    setQuery(locationString);
    setShowSuggestions(false);
    onLocationSelect(locationString);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (query.trim()) {
          setShowSuggestions(false);
          onLocationSelect(query.trim());
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      onLocationSelect(query.trim());
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={() => query.length > 1 && setShowSuggestions(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-10 pr-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 placeholder-gray-500"
          />
          {isLoading ? (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.name}-${suggestion.country}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-50 ${
                index === selectedIndex
                  ? "bg-green-50 text-green-700"
                  : "text-gray-900"
              }`}
            >
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{suggestion.name}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {suggestion.state ? `${suggestion.state}, ` : ""}
                    {suggestion.country}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {suggestion.display_name}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {suggestion.coordinates.lat.toFixed(2)},{" "}
                {suggestion.coordinates.lon.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
