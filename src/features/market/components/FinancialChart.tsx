'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { MarketDataPoint } from '../workers/marketData.worker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FinancialChartProps {
  data: MarketDataPoint[];
}

const FinancialChartComponent: React.FC<FinancialChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    return {
      labels: data.map((d) => {
        const date = new Date(d.time);
        return `${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
      }),
      datasets: [
        {
          label: 'Market Price',
          data: data.map((d) => d.value),
          borderColor: 'rgba(56, 189, 248, 1)',
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          borderWidth: 2,
          fill: true,
          pointRadius: 0,
          tension: 0.1,
        },
        {
          label: 'SMA 20',
          data: data.map((d) => d.sma20 || null),
          borderColor: 'rgba(167, 139, 250, 1)',
          borderWidth: 1.5,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
          tension: 0.2,
        },
        {
          label: 'SMA 50',
          data: data.map((d) => d.sma50 || null),
          borderColor: 'rgba(251, 146, 60, 1)',
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: 0.2,
        }
      ],
    };
  }, [data]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        labels: {
          color: '#9ca3af',
          usePointStyle: true,
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#6b7280',
          maxTicksLimit: 10,
        }
      },
      y: {
        position: 'right',
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#6b7280',
          callback: function (value) {
            return '$' + Number(value).toFixed(2);
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-[400px] bg-slate-900/50 rounded-xl p-4 border border-slate-800 backdrop-blur-sm shadow-xl relative overflow-hidden">
      {data.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            Connecting to data stream...
          </div>
        </div>
      ) : (
        <Line data={chartData} options={options} />
      )}
    </div>
  );
};

export const FinancialChart = React.memo(FinancialChartComponent);

