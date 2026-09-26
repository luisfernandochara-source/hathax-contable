"use client";
import { useState, useEffect, Suspense } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function EmpresaDashboardContent() {
  const searchParams = useSearchParams();
  const empresaId = searchParams.get('id');
  
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresaId) {
      setLoading(false);
      return;
    }
    
    const fetchEmpresa = async () => {
      try {
        const docRef = doc(db, "empresas", empresaId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEmpresa({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error loading empresa:", error);
      }
      setLoading(false);
    };
    fetchEmpresa();
  }, [empresaId]);

  if (loading) {
    return <div className="p-8 text-gray-400 flex items-center justify-center min-h-[50vh]">Cargando datos de la empresa...</div>;
  }

  if (!empresa) {
    return <div className="p-8 text-red-400">Empresa no encontrada o no tienes acceso.</div>;
  }

  return (
    <div className="w-full h-screen relative">
      <div className="absolute top-0 left-0 w-full h-12 bg-[#2d2d2e] border-b border-white/10 flex items-center px-4 justify-between z-50 shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm font-semibold flex items-center gap-2">
            <span className="text-xl">←</span> Mis Empresas
          </Link>
          <div className="h-6 w-px bg-white/20"></div>
          <span className="text-orange-400 font-bold">{empresa.nombre}</span>
          <span className="text-gray-500 text-sm">NIT: {empresa.nit}</span>
        </div>
      </div>
      <iframe 
        src={`/modulo/index.html?nit=${empresa.nit}&empresaId=${empresa.id}`}
        className="w-full h-full border-none pt-12 bg-[#0a0a0a]"
        title="Módulo Contable Original"
      />
    </div>
  );
}

export default function EmpresaDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Cargando...</div>}>
      <EmpresaDashboardContent />
    </Suspense>
  );
}
