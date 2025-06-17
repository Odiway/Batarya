// src/components/WorkLineCard.tsx
import React from 'react';
import { WorkLine, DataAvailabilityProps } from '../app/types'; // Import WorkLine type from types.ts

interface WorkLineCardProps extends DataAvailabilityProps {
  line: WorkLine; // This component specifically expects a WorkLine type
  onToggleStatus: (id: number) => void; // For toggling its status
}

const WorkLineCard: React.FC<WorkLineCardProps> = React.memo(
  ({ line, dataUnavailable, onToggleStatus }) => {
    const statusColor =
      line.status === 'working'
        ? 'text-green-600'
        : line.status === 'idle'
          ? 'text-gray-500'
          : 'text-red-600';
    const statusBg =
      line.status === 'working'
        ? 'bg-green-50'
        : line.status === 'idle'
          ? 'bg-gray-50'
          : 'bg-red-50';

    return (
      <div
        className={`p-3 rounded-lg shadow-sm border border-gray-200 ${statusBg}
                  ${dataUnavailable ? 'opacity-50 grayscale' : ''}`}
      >
        <h3 className="font-semibold text-sm mb-1">{line.name}</h3>
        <p className="text-xs">
          Durum: <span className={statusColor}>{line.status.replace(/_/g, ' ')}</span>
        </p>
        {line.currentBatteryModel && (
          <p className="text-xs">
            Model: <span className="font-medium">{line.currentBatteryModel}</span>
          </p>
        )}

        {/* Progress Bar - only for working lines */}
        {line.status === 'working' && line.progress !== undefined && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${line.progress}%` }}
            ></div>
            <p className="text-[10px] text-right mt-0.5">{line.progress}% Tamamlandı</p>
          </div>
        )}

        {/* Toggle Button */}
        {!dataUnavailable && (
          <button
            onClick={() => onToggleStatus(line.id)}
            className={`mt-2 px-2 py-1 rounded text-xs text-white
                      ${line.status === 'working' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {line.status === 'working' ? 'Durdur' : 'Başlat'}
          </button>
        )}

        {dataUnavailable && <p className="text-red-700 font-bold text-xs mt-2">Veri Alınamıyor!</p>}
      </div>
    );
  },
);

WorkLineCard.displayName = 'WorkLineCard'; // Set display name for better debugging

export default WorkLineCard;
