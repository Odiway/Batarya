'use client';
import { useState } from 'react';

type Master = {
  id: string;
  name: string;
  specialty: string;
  level: 'Başlangıç' | 'Orta' | 'İleri';
  notes: string[];
};

const initialMasters: Master[] = [
  {
    id: 'ahmet01',
    name: 'Ahmet Usta',
    specialty: 'Batarya Montajı',
    level: 'Orta',
    notes: ['Dikkatli çalışıyor.', 'Şemalara ihtiyaç duyuyor.'],
  },
  {
    id: 'zeynep02',
    name: 'Zeynep Usta',
    specialty: 'Tamir ve Onarım',
    level: 'İleri',
    notes: ['Analiz yeteneği yüksek.', 'Yeni yöntemler öğrenmek istiyor.'],
  },
  {
    id: 'mehmet03',
    name: 'Mehmet Usta',
    specialty: 'Güvenlik Protokolleri',
    level: 'Başlangıç',
    notes: ['Daha fazla rehbere ihtiyaç duyuyor.'],
  },
];

const levelColors: Record<Master['level'], string> = {
  Başlangıç: 'bg-yellow-100 text-yellow-800',
  Orta: 'bg-blue-100 text-blue-800',
  İleri: 'bg-green-100 text-green-800',
};

export default function SquadPage() {
  const [masters, setMasters] = useState(initialMasters);
  const [newNotes, setNewNotes] = useState<Record<string, string>>({});

  const handleAddNote = (id: string) => {
    const note = newNotes[id]?.trim();
    return;

    setMasters((prev) =>
      prev.map((master) =>
        master.id === id ? { ...master, notes: [...master.notes, note] } : master,
      ),
    );

    setNewNotes((prev) => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-center text-blue-800 drop-shadow">
          👥 Usta Gelişim Paneli
        </h1>
        <div className="grid gap-8 md:grid-cols-2">
          {masters.map((master) => (
            <div
              key={master.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-2xl font-bold text-white shadow">
                  {master.name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{master.name}</h2>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${levelColors[master.level]}`}
                  >
                    {master.level}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 mb-1">
                <strong className="text-gray-800">Uzmanlık:</strong> {master.specialty}
              </p>
              <div className="mt-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-blue-700 mb-1">📝 Yönetici Notları:</h3>
                <ul className="list-disc pl-6 space-y-1 mb-2 text-gray-800">
                  {master.notes.map((note, i) => (
                    <li key={i} className="bg-gray-50 rounded px-2 py-1">
                      {note}
                    </li>
                  ))}
                </ul>
                <textarea
                  className="w-full mt-2 border border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 transition"
                  rows={2}
                  placeholder="Yeni gelişim notu ekle..."
                  value={newNotes[master.id] || ''}
                  onChange={(e) =>
                    setNewNotes((prev) => ({ ...prev, [master.id]: e.target.value }))
                  }
                />
                <button
                  onClick={() => handleAddNote(master.id)}
                  className="mt-3 self-end bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition"
                >
                  Not Ekle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
