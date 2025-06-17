'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '../../../constants/roles'; // Role ve Roles birlikte import
import { useAuth } from '../../auth/context';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Role.USTA); // Role tipi kullanılıyor
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    router.push('/dashboard');
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Batarya Ustası Giriş</h1>

        <label className="block mb-2 font-semibold" htmlFor="email">
          E-posta
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block mb-2 font-semibold" htmlFor="role">
          Rol Seçiniz
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value={Role.ADMIN}>Admin</option>
          <option value={Role.YONETICI}>Yönetici</option>
          <option value={Role.USTA}>Usta</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Giriş Yap
        </button>
      </form>
    </main>
  );
}
