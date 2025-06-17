import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Props için interface tanımlayalım
interface LineChartProps {
  title: string;
  labels: string[];
  data: number[] | { [key: string]: number[] }; // Tek seri veya çoklu seri için
  borderColor: string | { [key: string]: string }; // Tek renk veya çoklu renk için
  yAxisLabel: string;
  min?: number;
  max?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  labels,
  data,
  borderColor,
  yAxisLabel,
  min,
  max,
}) => {
  // Çoklu data setini işlemek için yardımcı fonksiyon
  const getDatasets = () => {
    if (Array.isArray(data)) {
      return [
        {
          label: title,
          data: data,
          borderColor: borderColor as string,
          backgroundColor: `${borderColor}40`,
          tension: 0.1,
          fill: false,
          pointRadius: 0,
        },
      ];
    } else {
      return Object.keys(data).map((key, index) => ({
        label: key,
        data: data[key],
        borderColor:
          (borderColor as { [key: string]: string })[key] || `hsl(${index * 60}, 70%, 50%)`, // Varsayılan renk
        backgroundColor:
          ((borderColor as { [key: string]: string })[key] || `hsl(${index * 60}, 70%, 50%)`) +
          '40',
        tension: 0.1,
        fill: false,
        pointRadius: 0,
      }));
    }
  };

  const chartData: ChartData<'line'> = {
    // ChartData<T> tipi
    labels: labels,
    datasets: getDatasets(),
  };

  const options: ChartOptions<'line'> = {
    // ChartOptions<T> tipi
    responsive: true,
    animation: false,
    plugins: {
      legend: {
        position: 'top' as const, // 'top' string literal type
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Zaman (s)',
        },
        type: 'category',
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        title: {
          display: true,
          text: yAxisLabel,
        },
        min: min,
        max: max,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default LineChart;
