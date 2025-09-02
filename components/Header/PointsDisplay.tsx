import React from "react";

interface PointsDisplayProps {
  points: number;
  className?: string;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({
  points = 0,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:border-primary/30 transition-colors select-none cursor-pointer  ${className} `}
    >
      {/* 积分数值 */}
      <span className="text-base font-medium text-t-s leading-none">
        {points.toLocaleString()}
      </span>

      <svg
        viewBox="0 0 1024 1024"
        className="w-full h-full"
        fill="currentColor"
        width={16}
        height={16}
      >
        <path
          d="M538.752 519.04c192.64 0 343.552-76.416 343.552-173.952s-150.912-174.08-343.552-174.08-343.552 76.416-343.552 173.952 150.784 174.08 343.552 174.08z m0-296.832c172.288 0 292.352 64.768 292.352 122.752s-120.064 122.752-292.352 122.752-292.352-64.768-292.352-122.752 119.936-122.752 292.352-122.752zM857.472 577.28c-12.032-7.552-27.776-3.968-35.328 8.064-29.568 46.976-136.448 94.464-283.52 94.464-151.296 0-258.048-49.024-285.312-97.536-6.912-12.288-22.528-16.64-34.816-9.728s-16.64 22.528-9.728 34.816c41.6 73.984 174.208 123.648 329.856 123.648 150.784 0 282.112-47.616 326.784-118.4 7.552-12.032 3.968-27.776-7.936-35.328zM857.472 789.248c-12.032-7.552-27.776-3.968-35.328 8.064-29.568 46.976-136.448 94.464-283.52 94.464-151.296 0-258.048-49.024-285.312-97.536-6.912-12.288-22.528-16.64-34.816-9.728-12.288 6.912-16.64 22.528-9.728 34.816 41.6 73.984 174.208 123.648 329.856 123.648 150.784 0 282.112-47.616 326.784-118.4 7.552-11.904 3.968-27.776-7.936-35.328z"
          fill="#8a38fc"
        />
      </svg>
    </div>
  );
};

export default PointsDisplay;
