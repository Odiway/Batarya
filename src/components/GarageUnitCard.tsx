// src/components/GarageUnitCard.tsx
import React from 'react';
import { GarageUnit, DataAvailabilityProps } from '../app/types';

interface GarageUnitCardProps extends DataAvailabilityProps {
  unit: GarageUnit;
}

const GarageUnitCard: React.FC<GarageUnitCardProps> = React.memo(({ unit, dataUnavailable }) => {
  let statusColor = '';
  let statusText = '';
  switch (unit.status) {
    case 'empty':
      statusColor = 'bg-green-100 border-green-500 text-green-800';
      statusText = 'Ünite Boş';
      break;
    case 'full':
      statusColor = 'bg-yellow-100 border-yellow-500 text-yellow-800';
      statusText = 'Ünite Dolu';
      break;
    case 'active_work':
      statusColor = 'bg-red-100 border-red-500 text-red-800';
      statusText = 'Aktif Çalışma Var';
      break;
  }

  return (
    <div
      className={`p-2 rounded-lg shadow-sm border ${statusColor} ${dataUnavailable ? 'opacity-50 grayscale' : ''}`}
    >
      <h3 className="font-semibold text-sm">{unit.label}</h3>
      <p className="text-xs">Durum: {statusText}</p>
      {dataUnavailable && <p className="text-red-700 font-bold text-xs mt-2">Veri Alınamıyor!</p>}
    </div>
  );
});
GarageUnitCard.displayName = 'GarageUnitCard'; // Bu satırı ekleyin

export default GarageUnitCard;
