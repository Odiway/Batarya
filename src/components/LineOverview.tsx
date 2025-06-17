'use client';
import { useState } from 'react';

type LineStatus = 'active' | 'inactive';

type Line = {
  id: number;
  name: string;
  status: LineStatus;
  details: {
    battery: number;
    temperature: number;
    issues: string[];
  };
};

const defaultLines: Line[] = [
  { id: 1, name: 'Hat 1', status: 'inactive', details: { battery: 0, temperature: 0, issues: [] } },
  { id: 2, name: 'Hat 2', status: 'inactive', details: { battery: 0, temperature: 0, issues: [] } },
  { id: 3, name: 'Hat 3', status: 'inactive', details: { battery: 0, temperature: 0, issues: [] } },
  { id: 4, name: 'Hat 4', status: 'inactive', details: { battery: 0, temperature: 0, issues: [] } },
];

export default function LineOverview() {
  const [lines] = useState<Line[]>(defaultLines);
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);

  const startSimulation = () => {
    // Örnek verilerle bazı hatları aktifleştiriyoruz

    setSelectedLine(null); // seçimi temizle
  };

  return (
    <div className="p-6">
      <button
        onClick={startSimulation}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
      >
        Simülasyonu Başlat
      </button>

      <div className="grid grid-cols-2 gap-4">
        {lines.map((line) => (
          <button
            key={line.id}
            onClick={() => setSelectedLine(line)}
            className={`p-4 rounded-xl transition-all text-lg font-semibold ${
              line.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
            }`}
          >
            {line.name}
          </button>
        ))}
      </div>

      {selectedLine && (
        <div className="mt-6 p-4 bg-white rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">{selectedLine.name} Detayları</h3>
          <p>
            <strong>Batarya:</strong> {selectedLine.details.battery}%
          </p>
          <p>
            <strong>Sıcaklık:</strong> {selectedLine.details.temperature}°C
          </p>
          <p>
            <strong>Hatalar:</strong>{' '}
            {selectedLine.details.issues.length > 0
              ? selectedLine.details.issues.join(', ')
              : 'Yok'}
          </p>
        </div>
      )}
    </div>
  );
}
