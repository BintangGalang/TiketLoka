// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast'; // <-- IMPORT BARU

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* TOAST PROVIDER DITEMPATKAN DI AKHIR BODY */}
        <Toaster position="top-right" reverseOrder={false} /> 
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}