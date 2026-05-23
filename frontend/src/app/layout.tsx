import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VedaAI – AI Assessment Creator',
  description: 'Create AI-powered question papers in seconds',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F5F5F5] text-gray-900 antialiased`}>
        <Sidebar />
        <div className="lg:ml-[210px] min-h-screen flex flex-col">
          {children}
        </div>
        <Toaster position="top-right"
          toastOptions={{ style: { fontSize: '13px', borderRadius: '10px' } }}/>
      </body>
    </html>
  );
}
