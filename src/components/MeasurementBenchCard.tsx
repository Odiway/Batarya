// src/components/MeasurementBenchCard.tsx (Mevcut haliyle kaldı, ihtiyacınız olursa revize edilebilir)
import React from 'react';
import { MeasurementBench, DataAvailabilityProps } from '../app/types';

interface MeasurementBenchCardProps extends DataAvailabilityProps {
  bench: MeasurementBench;
}

const MeasurementBenchCard: React.FC<MeasurementBenchCardProps> = React.memo(
  ({ bench, dataUnavailable }) => {
    const statusColor =
      bench.status === 'working'
        ? 'text-blue-600'
        : bench.status === 'idle'
          ? 'text-gray-500'
          : 'text-red-600';

    return (
      <div
        className={`p-2 rounded-lg shadow-sm border border-gray-200 bg-white
                  ${dataUnavailable ? 'opacity-50 grayscale' : ''}`}
      >
        <h3 className="font-semibold text-sm mb-1">{bench.name}</h3>
        <p className="text-xs">
          Durum: <span className={statusColor}>{bench.status}</span>
        </p>
        <p className="text-xs">Çalışan: {bench.assignedTo || 'Yok'}</p>
        <p className="text-xs">Son Ölçüm: {bench.lastMeasuredAt || '-'}</p>
        {dataUnavailable && <p className="text-red-700 font-bold text-xs mt-2">Veri Alınamıyor!</p>}
      </div>
    );
  },
);

MeasurementBenchCard.displayName = 'MeasurementBenchCard';

export default MeasurementBenchCard;
