// /pages/api/sync.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { tasks } = req.body;

    // 🛠️ Placeholder: replace this with DB logic
    console.log('Syncing tasks to backend:', tasks);

    return res.status(200).json({ message: 'Sync successful' });
  }

  res.status(405).end(); // Method Not Allowed
}
