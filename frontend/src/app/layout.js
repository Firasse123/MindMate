import './globals.css';
import FloatingShape from "../components/FloatingShape";
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'MindMate',
  description: 'Your app description',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div 
          className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
        >
          <FloatingShape 
            color="bg-blue-400" 
            size="w-64 h-64" 
            top="-5%" 
            left="10%" 
            delay={0}
            style={{ backgroundColor: '#53B4EE' }}
          />
          
          <FloatingShape 
            color="bg-blue-500" 
            size="w-32 h-32" 
            top="40%" 
            left="-10%" 
            delay={2}
            style={{ backgroundColor: '#53B4EE' }}
          />

          {children}

          {/* Global Toaster for notifications */}
          <Toaster position="top-center" reverseOrder={false} />
        </div>
      </body>
    </html>
  );
}
