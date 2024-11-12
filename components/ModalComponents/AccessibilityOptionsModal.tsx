// components/AccessibilityOptionsModal.tsx

import React from "react";

interface AccessibilityOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  textSize: number;
  setTextSize: (size: number) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export default function AccessibilityOptionsModal({
  isOpen,
  onClose,
  textSize,
  setTextSize,
  isDarkMode,
  setIsDarkMode,
}: AccessibilityOptionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-80 rounded-lg bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Accessibility Options
        </h2>

        {/* Text Size Slider */}
        <div className="mb-4">
          <label htmlFor="text-size-slider" className="text-sm text-gray-700">
            Text Size:
          </label>
          <input
            id="text-size-slider"
            type="range"
            min="10"
            max="24"
            value={textSize}
            onChange={(e) => setTextSize(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-sm text-gray-700">{textSize}px</span>
        </div>

        {/* Theme Selection */}
        <div className="mb-4">
          <label className="text-sm text-gray-700">Theme:</label>
          <div className="mt-2 flex items-center">
            <div className="w-1/2 p-2">
              <button
                onClick={() => setIsDarkMode(true)}
                className={`w-full rounded-md bg-gray-800 px-4 py-2 text-white ${
                  isDarkMode
                    ? "border-4 border-blue-500"
                    : "border border-gray-700"
                }`}
              >
                Dark
              </button>
            </div>
            <div className="w-1/2 p-2">
              <button
                onClick={() => setIsDarkMode(false)}
                className={`w-full rounded-md bg-gray-200 px-4 py-2 text-black ${
                  !isDarkMode
                    ? "border-4 border-blue-500"
                    : "border border-gray-700"
                }`}
              >
                Light
              </button>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
