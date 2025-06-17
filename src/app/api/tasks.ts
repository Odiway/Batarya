// /pages/api/tasks.ts

import type { NextApiRequest, NextApiResponse } from 'next';

let tasks = [
  { id: '1', title: 'Çamaşır Makinesi Montajı' },
  { id: '2', title: 'Bulaşık Makinesi Montajı' },
  { id: '3', title: 'Televizyon Kurulumu' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(tasks);
  }

  if (req.method === 'POST') {
    const { newOrder } = req.body;
    if (!Array.isArray(newOrder)) {
      return res.status(400).json({ error: 'Invalid order' });
    }

    tasks = newOrder;
    return res.status(200).json({ message: 'Order updated', tasks });
  }

  res.status(405).end(); // Method Not Allowed
}
