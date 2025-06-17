// src/components/GarageDoorCard.tsx
import React from 'react';
import { GarageDoor, DataAvailabilityProps } from '../app/types';

interface GarageDoorCardProps extends DataAvailabilityProps {
  door: GarageDoor;
  onToggleStatus: (id: number) => void;
}

const GarageDoorCard: React.FC<GarageDoorCardProps> = ({ door, dataUnavailable }) => {
  const statusColor = door.status === 'open' ? 'text-green-600' : 'text-red-600';
  const icon = door.status === 'open' ? '🚪⬆️' : '🚪⬇️'; // Basit ikonlar

  return (
    <div
      className={`p-4 rounded-lg shadow border border-gray-200 text-center ${dataUnavailable ? 'opacity-50 grayscale' : ''}`}
    >
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="font-semibold">{door.name}</h3>
      <p className={`text-sm ${statusColor}`}>
        Durum: {door.status === 'open' ? 'Açık' : 'Kapalı'}
      </p>
      {dataUnavailable && <p className="text-red-700 font-bold mt-2">Veri Alınamıyor!</p>}
    </div>
  );
};

GarageDoorCard.displayName = 'GarageDoorCard';

export default GarageDoorCard;
