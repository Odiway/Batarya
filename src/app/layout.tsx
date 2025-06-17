'use client';
import AIAssistant from '@/components/AIAssistant';
import './globals.css';
import { AuthProvider } from './auth/context';
import Navbar from '../components/common/Navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
        <AIAssistant />
      </body>
    </html>
  );
}
