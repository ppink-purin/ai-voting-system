'use client';

import { useState } from 'react';

interface PresentationCardProps {
  id: number;
  teamName: string;
  title: string;
  currentRating: number | null;
  onRatingChange: (rating: number) => void;
  disabled: boolean;
}

export default function PresentationCard({
  id,
  teamName,
  title,
  currentRating,
  onRatingChange,
  disabled,
}: PresentationCardProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleRatingClick = (rating: number) => {
    if (!disabled) {
      onRatingChange(rating);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{teamName}</h3>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
      </div>

      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4, 5].map((rating) => {
          const isActive = hoveredRating !== null ? rating <= hoveredRating : currentRating !== null && rating <= currentRating;

          return (
            <button
              key={rating}
              onClick={() => handleRatingClick(rating)}
              onMouseEnter={() => !disabled && setHoveredRating(rating)}
              onMouseLeave={() => !disabled && setHoveredRating(null)}
              disabled={disabled}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-lg border-2 transition-all ${
                isActive
                  ? 'bg-yellow-400 border-yellow-500 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              } ${
                disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:scale-110 cursor-pointer'
              }`}
            >
              <span className="text-2xl">★</span>
            </button>
          );
        })}
      </div>

      {currentRating && (
        <p className="text-center mt-3 text-sm text-gray-600">
          {currentRating}점 선택됨
        </p>
      )}

      {disabled && (
        <p className="text-center mt-3 text-sm text-red-600 font-medium">
          투표가 종료되었습니다
        </p>
      )}
    </div>
  );
}
