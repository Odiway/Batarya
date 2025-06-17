// src/components/ShelfCard.tsx
import React from 'react';
import { Shelf, DataAvailabilityProps, ShelfItem } from '../app/types';

interface ShelfCardProps extends DataAvailabilityProps {
  shelf: Shelf;
  onShelfClick: (items: ShelfItem[]) => void; // Modal açma callback'i
}

const ShelfCard: React.FC<ShelfCardProps> = React.memo(
  ({ shelf, dataUnavailable, onShelfClick }) => {
    // Rafın genel olarak kritik olup olmadığını kontrol et
    // Kendi critical bayrağı veya herhangi bir bölümdeki kritik ürün varlığı
    const isOverallCritical =
      shelf.critical ||
      shelf.sections.some((section) => section.items.some((item) => item.criticalLevel));

    return (
      <div
        className={`p-2 rounded-lg shadow-sm border
                  ${isOverallCritical ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}
                  ${dataUnavailable ? 'opacity-50 grayscale' : ''}`} // Veri alınamıyorsa soluk göster
      >
        <h4 className="font-semibold text-sm mb-1">{shelf.label}</h4>

        {/* Bölmeleri listele ve tıklanınca modalı aç */}
        <div className="space-y-1">
          {shelf.sections.map((section) => (
            <div
              key={section.id}
              className={`p-1 border rounded text-xs cursor-pointer hover:bg-gray-100
                        ${section.isEmpty ? 'bg-gray-200 text-gray-500' : 'bg-blue-50 text-blue-800'}`}
              onClick={() => onShelfClick(section.items)} // Tıklanınca ilgili bölümdeki ürünleri moda gönder
            >
              <p className="font-medium">{section.label}</p>
              {section.items.length > 0 ? (
                <ul className="list-disc list-inside ml-2">
                  {section.items.map((item) => (
                    <li
                      key={item.id}
                      className={`${item.criticalLevel ? 'text-red-600 font-bold' : ''}`}
                    >
                      {item.name}: {item.quantity} adet {item.criticalLevel && '⚠️'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Boş</p>
              )}
            </div>
          ))}
        </div>

        {isOverallCritical && <p className="text-red-500 font-bold text-xs mt-2">Kritik Seviye!</p>}
        {dataUnavailable && <p className="text-red-700 font-bold text-xs mt-2">Veri Alınamıyor!</p>}
      </div>
    );
  },
);

ShelfCard.displayName = 'ShelfCard';

export default ShelfCard;
