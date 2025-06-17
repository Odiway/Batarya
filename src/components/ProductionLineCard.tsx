// src/components/ProductionLineCard.tsx
import React from 'react';
import { ProductionLine, DataAvailabilityProps } from '../app/types';

interface ProductionLineCardProps extends DataAvailabilityProps {
  line: ProductionLine;
  onToggleStatus: (id: number) => void; // Durum değiştirme fonksiyonu
}

const ProductionLineCard: React.FC<ProductionLineCardProps> = React.memo(
  ({ line, dataUnavailable, onToggleStatus }) => {
    const statusColor =
      line.status === 'active'
        ? 'text-green-600'
        : line.status === 'paused'
          ? 'text-orange-500'
          : 'text-red-600';
    const statusBg =
      line.status === 'active'
        ? 'bg-green-50'
        : line.status === 'paused'
          ? 'bg-orange-50'
          : 'bg-red-50';

    return (
      <div
        className={`p-3 rounded-lg shadow-sm border border-gray-200 ${statusBg}
                  ${dataUnavailable ? 'opacity-50 grayscale' : ''}`}
      >
        <h3 className="font-semibold text-sm mb-1">{line.name}</h3>
        <p className="text-xs">
          Durum:{' '}
          <span className={statusColor}>
            {line.status === 'active'
              ? 'Aktif'
              : line.status === 'paused'
                ? 'Durduruldu'
                : line.status}
          </span>
        </p>
        <p className="text-xs">Enerji: {line.energyConsumption}W</p>
        <p className="text-xs">Ustalar: {line.operators.join(', ') || '-'}</p>
        <p className="text-xs">Üretilen Parça: {line.partsProduced}</p>
        {line.currentBatteryModel && (
          <p className="text-xs">
            İşlenen Model: <span className="font-medium">{line.currentBatteryModel}</span>
          </p>
        )}
        {line.status === 'active' &&
          line.progress !== undefined && ( // İlerleme çubuğu
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${line.progress}%` }}
              ></div>
              <p className="text-[10px] text-right mt-0.5">{line.progress}% Tamamlandı</p>
            </div>
          )}

        {!dataUnavailable && ( // Veri varsa butonları göster
          <button
            onClick={() => onToggleStatus(line.id)}
            className={`mt-2 px-2 py-1 rounded text-xs text-white
                      ${line.status === 'active' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {line.status === 'active' ? 'Durdur' : 'Başlat'}
          </button>
        )}

        {dataUnavailable && <p className="text-red-700 font-bold text-xs mt-2">Veri Alınamıyor!</p>}
      </div>
    );
  },
);

ProductionLineCard.displayName = 'ProductionLineCard'; // Bu satırı ekleyin

export default ProductionLineCard;
