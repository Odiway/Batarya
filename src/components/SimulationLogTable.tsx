// components/SimulationLogTable.tsx
import React from 'react';
import { SimulationLog } from '@/lib/simulationUtils';

interface Props {
  logs: SimulationLog[];
}

export const SimulationLogTable = ({ logs }: Props) => {
  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Zaman (dk)</th>
            <th className="p-2 border">Batarya ID</th>
            <th className="p-2 border">Cycle</th>
            <th className="p-2 border">Hat</th>
            <th className="p-2 border">İşlem</th>
            <th className="p-2 border">Durum</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <tr key={idx} className="text-center">
              <td className="p-2 border">{log.timestamp}</td>
              <td className="p-2 border">{log.batteryId}</td>
              <td className="p-2 border">{log.cycle}</td>
              <td className="p-2 border">{log.line + 1}</td>
              <td className="p-2 border">{log.action}</td>
              <td className="p-2 border">{log.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
