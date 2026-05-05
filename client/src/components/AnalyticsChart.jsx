import { useState } from 'react';

export default function AnalyticsChart({ data, type = 'line', title, xAxisLabel, yAxisLabel }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Simple bar chart
  if (type === 'bar') {
    const maxValue = Math.max(...data.map(d => d.value));
    const chartHeight = 300;
    const barWidth = 100 / data.length * 0.8;
    const barGap = 100 / data.length * 0.2;

    return (
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '700'
        }}>
          {title}
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          height: chartHeight,
          padding: '16px',
          background: '#f9f9f9',
          borderRadius: '4px',
          gap: '8px'
        }}>
          {data.map((item, idx) => {
            const percentage = (item.value / maxValue) * 100;
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                {isHovered && (
                  <div style={{
                    background: '#333',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.value}
                  </div>
                )}

                <div
                  style={{
                    width: '100%',
                    height: `${percentage}%`,
                    background: isHovered ? '#1976D2' : '#2196F3',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.2s',
                    minHeight: '4px'
                  }}
                />

                <div style={{
                  marginTop: '8px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#666',
                  fontWeight: '500',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#999'
        }}>
          <span>{xAxisLabel}</span>
          <span>{yAxisLabel}</span>
        </div>
      </div>
    );
  }

  // Line chart
  if (type === 'line') {
    const rawMax = Math.max(...data.map(d => d.value));
    // Round up to a nice number so Y axis labels are clean integers
    const niceMax = rawMax <= 5 ? 5 : rawMax <= 10 ? 10 : Math.ceil(rawMax / 5) * 5;
    const yTicks  = [0, 0.25, 0.5, 0.75, 1.0].map(t => Math.round(t * niceMax));
    const chartWidth = 600;
    const chartHeight = 300;
    const pointSpacingX = chartWidth / (data.length - 1 || 1);

    // Calculate points for SVG path
    let pathD = '';
    data.forEach((item, idx) => {
      const x = idx * pointSpacingX;
      const y = chartHeight - (item.value / niceMax) * chartHeight;
      pathD += `${x},${y} `;
    });

    return (
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '700'
        }}>
          {title}
        </h3>

        <div style={{
          position: 'relative',
          width: '100%',
          height: chartHeight,
          background: '#f9f9f9',
          borderRadius: '4px',
          padding: '16px',
          boxSizing: 'border-box',
          border: '1px solid #e0e0e0'
        }}>
          <svg
            width="100%"
            height="100%"
            style={{ overflow: 'visible' }}
          >
            {/* Grid lines — actual value labels */}
            {yTicks.map((tick, idx) => {
              const y = chartHeight * (1 - tick / niceMax);
              return (
                <g key={idx}>
                  <line
                    x1="0"
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="#e0e0e0"
                    strokeDasharray="4"
                    strokeWidth="1"
                  />
                  <text
                    x="-8"
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#999"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Line */}
            <polyline
              points={pathD}
              fill="none"
              stroke="#2196F3"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />

            {/* Points */}
            {data.map((item, idx) => {
              const x = idx * pointSpacingX;
              const y = chartHeight - (item.value / niceMax) * chartHeight;

              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={hoveredIndex === idx ? 6 : 4}
                    fill={hoveredIndex === idx ? '#1976D2' : '#2196F3'}
                    transition="all 0.2s"
                  />

                  {hoveredIndex === idx && (
                    <text
                      x={x}
                      y={y - 20}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#333"
                      fontWeight="600"
                    >
                      {item.value}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#999'
        }}>
          <span>{xAxisLabel}</span>
          <span>{yAxisLabel}</span>
        </div>
      </div>
    );
  }

  // Pie chart
  if (type === 'pie') {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const colors = ['#2196F3', '#FF9800', '#4CAF50', '#f44336', '#9C27B0', '#FFC107'];
    let currentAngle = 0;

    const slices = data.map((item, idx) => {
      const sliceAngle = (item.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = 100 + 80 * Math.cos(startRad);
      const y1 = 100 + 80 * Math.sin(startRad);
      const x2 = 100 + 80 * Math.cos(endRad);
      const y2 = 100 + 80 * Math.sin(endRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;

      const pathData = [
        `M 100 100`,
        `L ${x1} ${y1}`,
        `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      const percentage = ((item.value / total) * 100).toFixed(1);

      const result = {
        path: pathData,
        color: colors[idx % colors.length],
        label: `${item.label}: ${percentage}%`,
        value: item.value
      };

      currentAngle = endAngle;
      return result;
    });

    return (
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '700'
        }}>
          {title}
        </h3>

        <div style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center'
        }}>
          <svg width="240" height="240" style={{ flexShrink: 0 }}>
            {slices.map((slice, idx) => (
              <path
                key={idx}
                d={slice.path}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
                opacity={hoveredIndex === idx ? 1 : 0.8}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
              />
            ))}
          </svg>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {slices.map((slice, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  background: hoveredIndex === idx ? '#f5f5f5' : 'transparent'
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    background: slice.color
                  }}
                />
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {slice.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}