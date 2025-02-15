import { useState, useEffect, useRef } from "react";
import { HoveredPoint, StockData } from "../types/StockData";

const StockChart = ({ data }: { data: StockData[] }) => {
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Update dimensions on mount and window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const padding = 40;
  const rightPadding = 60;

  // Calculate scales
  const minPrice = Math.min(...data.map((d) => d.price));
  const maxPrice = Math.max(...data.map((d) => d.price));
  const priceRange = maxPrice - minPrice;

  // Scale functions
  const getX = (index: number): number =>
    padding +
    index * ((dimensions.width - padding - rightPadding) / (data.length - 1));

  const getY = (price: number): number =>
    dimensions.height -
    padding -
    ((price - minPrice) / priceRange) * (dimensions.height - 2 * padding);

  // Generate path for the line
  const pathData = data
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(point.price)}`
    )
    .join(" ");

  const formatPrice = (price: number): string => {
    return price.toFixed(price < 100 ? 2 : 1);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
      day: "numeric",
    });
  };

  const handleMouseEnter = (point: StockData, index: number): void => {
    setHoveredPoint({
      point,
      x: getX(index),
      y: getY(point.price),
    });
  };

  const handleMouseLeave = (): void => {
    setHoveredPoint(null);
  };

  return (
    <div ref={containerRef} className="w-screen h-screen">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <svg width={dimensions.width} height={dimensions.height}>
          {/* Background grid lines */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((percent) => {
            const y = padding + (dimensions.height - 2 * padding) * percent;
            return (
              <line
                key={percent}
                x1={padding}
                y1={y}
                x2={dimensions.width - rightPadding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}

          {/* X-axis */}
          <line
            x1={padding}
            y1={dimensions.height - padding}
            x2={dimensions.width - rightPadding}
            y2={dimensions.height - padding}
            stroke="gray"
            strokeWidth="1"
          />

          {/* Right Y-axis */}
          <line
            x1={dimensions.width - rightPadding}
            y1={padding}
            x2={dimensions.width - rightPadding}
            y2={dimensions.height - padding}
            stroke="gray"
            strokeWidth="1"
          />

          {/* Price labels on right */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((percent) => {
            const price = minPrice + priceRange * (1 - percent);
            return (
              <text
                key={percent}
                x={dimensions.width - rightPadding + 10}
                y={padding + (dimensions.height - 2 * padding) * percent}
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
                y={dimensions.height - padding + 20}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {formatDate(point.date)}
              </text>
            ))}

          {/* Line chart */}
          <path d={pathData} fill="none" stroke="#000000" strokeWidth="1.5" />

          {/* Invisible hover areas */}
          {data.map((point, index) => (
            <rect
              key={index}
              x={getX(index) - dimensions.width / data.length / 2}
              y={padding}
              width={dimensions.width / data.length}
              height={dimensions.height - 2 * padding}
              fill="transparent"
              onMouseEnter={() => handleMouseEnter(point, index)}
              onMouseLeave={handleMouseLeave}
              className="cursor-crosshair"
            />
          ))}

          {/* Hover tooltip */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={padding}
                x2={hoveredPoint.x}
                y2={dimensions.height - padding}
                stroke="#E1524D"
                strokeWidth="1"
                strokeDasharray="4,4"
              />

              <line
                x1={padding}
                y1={hoveredPoint.y}
                x2={dimensions.width - rightPadding}
                y2={hoveredPoint.y}
                stroke="#E1524D"
                strokeWidth="1"
                strokeDasharray="4,4"
              />

              <rect
                x={hoveredPoint.x - 75}
                y={hoveredPoint.y - 45}
                width="150"
                height="35"
                rx="4"
                className="fill-[#E1524D]"
              />

              <text
                x={hoveredPoint.x}
                y={hoveredPoint.y - 31}
                textAnchor="middle"
                className="fill-white text-xs"
              >
                {formatDate(hoveredPoint.point.date)}
              </text>
              <text
                x={hoveredPoint.x}
                y={hoveredPoint.y - 15.5}
                textAnchor="middle"
                className="fill-white text-xs font-bold"
              >
                ${formatPrice(hoveredPoint.point.price)}
              </text>
            </g>
          )}
        </svg>
      )}
    </div>
  );
};

export default StockChart;
