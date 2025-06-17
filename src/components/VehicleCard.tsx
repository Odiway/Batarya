// src/components/VehicleCard.tsx
import React from 'react';
import { Vehicle, DataAvailabilityProps } from '../app/types';

interface VehicleCardProps extends DataAvailabilityProps {
  vehicle: Vehicle;
}

const VehicleCard: React.FC<VehicleCardProps> = React.memo(({ vehicle, dataUnavailable }) => {
  const statusColor = vehicle.status === 'in_garage' ? 'text-blue-600' : 'text-orange-600';
  const icon = vehicle.type === 'golf_car' ? '⛳🚗' : '🚚';

  return (
    <div
      className={`p-2 rounded-lg shadow-sm border border-gray-200 bg-white
                  ${dataUnavailable ? 'opacity-50 grayscale' : ''}`}
    >
      <div className="text-2xl mb-0.5">{icon}</div>
      <h3 className="font-semibold text-sm">{vehicle.name}</h3>
      <p className={`text-xs ${statusColor}`}>
        Konum: {vehicle.status === 'in_garage' ? 'Garajda' : 'Dışarıda'}
      </p>
      {dataUnavailable && <p className="text-red-700 font-bold text-xs mt-2">Veri Alınamıyor!</p>}
    </div>
  );
});

VehicleCard.displayName = 'VehicleCard'; // Bu satırı ekleyin

export default VehicleCard;
