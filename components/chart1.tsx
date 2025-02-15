import React, { useState } from "react";

// Types
interface StockData {
  date: string;
  price: number;
}

interface HoveredPoint {
  point: StockData;
  x: number;
  y: number;
}

const StockChart = () => {
  // Generate 2 years of daily trading data
  const generateData = (): StockData[] => {
    const data: StockData[] = [];
    let currentPrice = 150;
    const startDate = new Date("2022-02-15");
    const volatility = 0.02; // 2% daily volatility

    for (let i = 0; i < 520; i++) {
      // ~520 trading days in 2 years
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Random walk with mean reversion
      const change = (Math.random() - 0.5) * volatility * currentPrice;
      currentPrice = currentPrice + change;

      // Ensure price stays positive and add some trends
      currentPrice = Math.max(currentPrice, 50);
      // Add some general upward trend
      currentPrice *= 1 + 0.0001;

      data.push({
        date: date.toISOString().split("T")[0],
        price: currentPrice,
      });
    }
    return data;
  };

  const data = generateData();
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);

  // Chart dimensions
  const width = 1000;
  const height = 500;
  const padding = 40;
  const rightPadding = 60; // Extra padding for right y-axis

  // Calculate scales
  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const priceRange = maxPrice - minPrice;

  // Scale functions
  const getX = (index: number): number =>
    padding + index * ((width - padding - rightPadding) / (data.length - 1));

  const getY = (price: number): number =>
    height -
    padding -
    ((price - minPrice) / priceRange) * (height - 2 * padding);

  // Generate path for the line
  const pathData = data
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(point.price)}`
    )
    .join(" ");

  // Format price with appropriate decimals
  const formatPrice = (price: number): string => {
    return price.toFixed(price < 100 ? 2 : 1);
  };

  // Format date for labels
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
      day: "numeric",
    });
  };

  // Handler for mouse enter
  const handleMouseEnter = (point: StockData, index: number): void => {
    setHoveredPoint({
      point,
      x: getX(index),
      y: getY(point.price),
    });
  };

  // Handler for mouse leave
  const handleMouseLeave = (): void => {
    setHoveredPoint(null);
  };

  return (
    <div className="relative">
      <svg
        width={width}
        height={height}
        className="bg-white border border-gray-200 rounded-lg"
      >
        {/* Background grid lines */}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((percent) => {
          const y = padding + (height - 2 * padding) * percent;
          return (
            <line
              key={percent}
              x1={padding}
              y1={y}
              x2={width - rightPadding}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* X-axis */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - rightPadding}
          y2={height - padding}
          stroke="gray"
          strokeWidth="1"
        />

        {/* Right Y-axis */}
        <line
          x1={width - rightPadding}
          y1={padding}
          x2={width - rightPadding}
          y2={height - padding}
          stroke="gray"
          strokeWidth="1"
        />

        {/* Price labels on right */}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((percent) => {
          const price = minPrice + priceRange * (1 - percent);
          return (
            <text
              key={percent}
              x={width - rightPadding + 10}
              y={padding + (height - 2 * padding) * percent}
              textAnchor="start"
              alignmentBaseline="middle"
              className="text-xs fill-gray-500"
            >
              ${formatPrice(price)}
            </text>
          );
        })}

        {/* Date labels */}
        {data
          .filter((_, i) => i % 60 === 0)
          .map((point, index) => (
            <text
              key={index}
              x={getX(index * 60)}
              y={height - padding + 20}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {formatDate(point.date)}
            </text>
          ))}

        {/* Line chart */}
        <path d={pathData} fill="none" stroke="#2563eb" strokeWidth="1" />

        {/* Invisible hover areas */}
        {data.map((point, index) => (
          <rect
            key={index}
            x={getX(index) - width / data.length / 2}
            y={padding}
            width={width / data.length}
            height={height - 2 * padding}
            fill="transparent"
            onMouseEnter={() => handleMouseEnter(point, index)}
            onMouseLeave={handleMouseLeave}
            className="cursor-crosshair"
          />
        ))}

        {/* Hover tooltip */}
        {hoveredPoint && (
          <g>
            {/* Vertical line */}
            <line
              x1={hoveredPoint.x}
              y1={padding}
              x2={hoveredPoint.x}
              y2={height - padding}
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="4,4"
            />

            {/* Horizontal line */}
            <line
              x1={padding}
              y1={hoveredPoint.y}
              x2={width - rightPadding}
              y2={hoveredPoint.y}
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="4,4"
            />

            {/* Tooltip background */}
            <rect
              x={hoveredPoint.x - 75}
              y={hoveredPoint.y - 45}
              width="150"
              height="35"
              rx="4"
              className="fill-gray-800"
            />

            {/* Tooltip text */}
            <text
              x={hoveredPoint.x}
              y={hoveredPoint.y - 25}
              textAnchor="middle"
              className="fill-white text-xs"
            >
              {formatDate(hoveredPoint.point.date)}
            </text>
            <text
              x={hoveredPoint.x}
              y={hoveredPoint.y - 15}
              textAnchor="middle"
              className="fill-white text-xs font-bold"
            >
              ${formatPrice(hoveredPoint.point.price)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default StockChart;
