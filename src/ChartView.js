import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function parseData(str) {
  // 예: "1,2,3; 4,5,6" -> [[1,2,3],[4,5,6]]
  if (!str) return [];
  return str
    .split(';')
    .map(row => row.trim().split(',').map(Number))
    .filter(row => row.every(n => !isNaN(n)));
}

function ChartView({ dataStr }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current;
    const parsed = parseData(dataStr);
    if (!ctx || parsed.length === 0) return;
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: parsed[0]?.map((_, i) => `점${i+1}`) || [],
        datasets: parsed.map((row, i) => ({
          label: `데이터${i+1}`,
          data: row,
          fill: false,
          borderColor: `hsl(${i*60}, 70%, 50%)`,
          tension: 0.2,
        })),
      },
      options: {
        plugins: { legend: { display: true } },
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
      },
    });
    return () => chart.destroy();
  }, [dataStr]);

  return (
    <div className="chart-wrap">
      <canvas ref={canvasRef} height={180} />
    </div>
  );
}

export default ChartView;
