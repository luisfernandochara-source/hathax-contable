'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.replace('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null; // Previene un destello antes del redireccionamiento

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex text-white font-sans">
      
      {/* Sidebar Lateral */}
      <aside className="w-64 border-r border-white/10 flex flex-col" style={{ backgroundColor: '#2d2d2e' }}>
        <div className="p-4 border-b border-white/10 flex items-center justify-center">
          <Image priority={true} src="/logo.png" alt="HATHAX" width={200} height={50} className="w-full h-auto object-contain" />
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-500/10 text-orange-500">
            <i className="fa-solid fa-building"></i>
            Mis Empresas
          </a>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="mb-4 px-2">
            <p className="text-xs text-gray-400 truncate">Sesión iniciada como:</p>
            <p className="text-sm font-medium truncate" title={user.email}>{user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
