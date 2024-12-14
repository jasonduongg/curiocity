import React, { useState } from "react";
import Image from "next/image";
import SearchImage from "@/assets/filter.png";

interface ButtonProps {
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onApplyFilters?: (filters: {
    sortOrder: string;
    fileTypes: string[];
    dateRange: { from: string; to: string };
  }) => void;
}

const Filter: React.FC<ButtonProps> = ({
  onClick,
  type = "button",
  disabled = false,
  onApplyFilters,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Default states
  const defaultSortOrder = "";
  const defaultFileTypes: string[] = [];
  const defaultDateRange = { from: "", to: "" };

  const [sortOrder, setSortOrder] = useState<string>(defaultSortOrder);
  const [fileTypes, setFileTypes] = useState<string[]>(defaultFileTypes);
  const [dateRange, setDateRange] = useState(defaultDateRange);

  const handleButtonClick = () => {
    setIsModalOpen(true);
    if (onClick) onClick();
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters({
        sortOrder,
        fileTypes,
        dateRange,
      });
    }
    closeModal();
  };

  const handleCancel = () => {
    // Reset to defaults
    setSortOrder(defaultSortOrder);
    setFileTypes(defaultFileTypes);
    setDateRange(defaultDateRange);

    // Notify parent to show all files (no filters)
    if (onApplyFilters) {
      onApplyFilters({
        sortOrder: defaultSortOrder,
        fileTypes: defaultFileTypes,
        dateRange: defaultDateRange,
      });
    }

    closeModal();
  };

  const toggleFileType = (type: string) => {
    setFileTypes((prev) =>
      prev.includes(type)
        ? prev.filter((fileType) => fileType !== type)
        : [...prev, type],
    );
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="ml-2 flex h-10 w-10 items-center justify-center rounded-md bg-gray-700 text-white hover:bg-blue-600"
        type={type}
        disabled={disabled}
      >
        <Image src={SearchImage} alt="Search" className="h-5 w-5" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-1/3 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Filter Options</h2>

            {/* Sort */}
            <div className="mb-4">
              <h3 className="mb-2 font-semibold text-gray-700">Sort</h3>
              <div className="flex flex-col space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sortOrder"
                    value="a-z"
                    checked={sortOrder === "a-z"}
                    onChange={() => setSortOrder("a-z")}
                    className="mr-2"
                  />
                  Sort A-Z
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sortOrder"
                    value="z-a"
                    checked={sortOrder === "z-a"}
                    onChange={() => setSortOrder("z-a")}
                    className="mr-2"
                  />
                  Sort Z-A
                </label>
              </div>
            </div>

            {/* File Type */}
            <div className="mb-4">
              <h3 className="mb-2 font-semibold text-gray-700">File Type</h3>
              <div className="flex flex-wrap gap-4">
                {["PDF", "Excel", "Word", "PowerPoint", "Link"].map((type) => (
                  <label className="flex items-center" key={type}>
                    <input
                      type="checkbox"
                      checked={fileTypes.includes(type)}
                      onChange={() => toggleFileType(type)}
                      className="mr-2"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="mb-4">
              <h3 className="mb-2 font-semibold text-gray-700">Date</h3>
              <div className="flex flex-col space-y-4">
                <label className="flex items-center">
                  <span className="w-16 text-gray-700">From:</span>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, from: e.target.value })
                    }
                    className="flex-1 rounded-md border border-gray-300 px-2 py-1"
                  />
                </label>
                <label className="flex items-center">
                  <span className="w-16 text-gray-700">To:</span>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, to: e.target.value })
                    }
                    className="flex-1 rounded-md border border-gray-300 px-2 py-1"
                  />
                </label>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancel}
                className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Filter;
