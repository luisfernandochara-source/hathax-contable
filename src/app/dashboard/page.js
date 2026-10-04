"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, getDoc, setDoc, increment } from 'firebase/firestore';

export default function DashboardPage() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmpresaId, setEditingEmpresaId] = useState(null);
  
  // Formulario nueva/editar empresa
  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const [estado, setEstado] = useState('Activa');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [userPlan, setUserPlan] = useState('Starter');
  const [maxEmpresas, setMaxEmpresas] = useState(3);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [empresasHistoricas, setEmpresasHistoricas] = useState(0);



  const fetchUserData = async (uid) => {
    try {

      const userRef = doc(db, 'usuarios', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserPlan(data.plan || 'Demo');
        setEmpresasHistoricas(data.empresasCreadasHistorico || 0);
        
        // Trial logic
        if (data.plan === 'Demo' && data.createdAt) {
          const createdDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
          if (Date.now() - createdDate.getTime() > thirtyDaysInMs) {
            setMaxEmpresas(0); // Expiró, no puede tener empresas activas
            setIsUpgradeModalOpen(true); // Forzar mostrar modal
          } else {
            setMaxEmpresas(data.maxEmpresas || 1);
          }
        } else {
          setMaxEmpresas(data.maxEmpresas || 3);
        }
      } else {
        // Create default profile
        await setDoc(userRef, {
          email: auth.currentUser?.email || '',
          plan: 'Demo',
          maxEmpresas: 1,
          createdAt: serverTimestamp()
        });
        setUserPlan('Demo');
        setMaxEmpresas(1);
      }
    } catch (e) {
      console.error('Error fetching user data', e);
    }
  };

  const fetchEmpresas = async (uid) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "empresas"), 
        where("ownerId", "==", uid)
      );
      const querySnapshot = await getDocs(q);
      const empresasList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmpresas(empresasList);
    } catch (error) {
      console.error("Error cargando empresas:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid);
        fetchEmpresas(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setNombre('');
    setNit('');
    setEstado('Activa');
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setEditingEmpresaId(null);
  };

  const handleCrearEmpresa = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !nit.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "empresas"), {
        nombre: nombre,
        nit: nit.replace(/\D/g, ''),
        ownerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        estado: 'Activa'
      });
      
      // Update historic counter
      await updateDoc(doc(db, "usuarios", auth.currentUser.uid), {
        empresasCreadasHistorico: increment(1)
      });
      setEmpresasHistoricas(prev => prev + 1);
      
      resetForm();
      fetchEmpresas(auth.currentUser.uid); // Recargar la lista
    } catch (error) {
      console.error("Error creando empresa:", error);
      alert("Error al crear la empresa");
    }
    setIsSubmitting(false);
  };


  const handleOpenNuevaEmpresa = () => {
    if (userPlan === 'Demo') {
      if (empresasHistoricas >= maxEmpresas || empresas.length >= maxEmpresas) {
        setIsUpgradeModalOpen(true);
        return;
      }
    } else {
      if (empresas.length >= maxEmpresas) {
        setIsUpgradeModalOpen(true);
        return;
      }
    }
    setIsModalOpen(true);
  };

  const openEditModal = (e, emp) => {
    e.stopPropagation();
    setEditingEmpresaId(emp.id);
    setNombre(emp.nombre);
    setNit(emp.nit);
    setEstado(emp.estado || 'Activa');
    setIsEditModalOpen(true);
  };

  const handleUpdateEmpresa = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !nit.trim()) return;

    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "empresas", editingEmpresaId), {
        nombre: nombre,
        nit: nit.replace(/\D/g, ''),
        estado: estado
      });
      resetForm();
      fetchEmpresas(auth.currentUser.uid);
    } catch (error) {
      console.error("Error actualizando empresa:", error);
      alert("Error al actualizar la empresa");
    }
    setIsSubmitting(false);
  };

  const handleDeleteEmpresa = async (e, id) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de que deseas eliminar esta empresa? Esto no se puede deshacer.')) return;
    
    try {
      await deleteDoc(doc(db, "empresas", id));
      resetForm();
      fetchEmpresas(auth.currentUser.uid);
    } catch (error) {
      console.error("Error eliminando empresa:", error);
      alert("Error al eliminar la empresa");
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="p-8 relative min-h-full">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Mis Empresas</h1>
          <p className="text-gray-400 mt-1">Selecciona una empresa para gestionar su contabilidad.</p>
        </div>
        <button 
          onClick={handleOpenNuevaEmpresa}
          className="px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-lg shadow-orange-500/20"
        >
          + Nueva Empresa
        </button>
      </header>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-20 text-gray-500">
          Cargando tus empresas...
        </div>
      ) : empresas.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
          <p className="text-gray-400 mb-4">Aún no tienes empresas registradas.</p>
          <button 
            onClick={handleOpenNuevaEmpresa}
            className="px-5 py-2.5 rounded-lg border border-orange-500 text-orange-500 hover:bg-orange-500/10 font-semibold transition-colors"
          >
            Crear mi primera empresa
          </button>
        </div>
      ) : (
        /* Grid de Empresas (Datos Reales) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresas.map((emp) => (
            <div 
              key={emp.id} 
              onClick={() => router.push(`/dashboard/empresa?id=${emp.id}`)}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-white/10 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xl uppercase">
                  {getInitial(emp.nombre)}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs rounded-full border ${emp.estado === 'Inactiva' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                    {emp.estado || 'Activa'}
                  </span>
                  <button 
                    onClick={(e) => openEditModal(e, emp)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 flex items-center justify-center text-gray-400 transition-colors"
                    title="Configuración de Empresa"
                  >
                    <i className="fa-solid fa-gear text-sm"></i>
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold group-hover:text-orange-400 transition-colors">{emp.nombre}</h3>
              <p className="text-sm text-gray-400 mt-1">NIT: {emp.nit}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nueva Empresa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#2d2d2e] rounded-2xl border border-white/10 shadow-2xl p-6">
            <h2 className="text-2xl font-bold mb-6">Nueva Empresa</h2>
            <form onSubmit={handleCrearEmpresa} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre o Razón Social</label>
                <input 
                  type="text" 
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white outline-none transition-colors"
                  placeholder="Ej. Mi Empresa S.A.S"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">NIT</label>
                <input 
                  type="text" 
                  required
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white outline-none transition-colors"
                  placeholder="Ej. 900.123.456-7"
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg bg-orange-500 text-white font-semibold shadow-lg shadow-orange-500/20 ${isSubmitting ? 'opacity-70' : 'hover:bg-orange-600'}`}
                >
                  {isSubmitting ? 'Guardando...' : 'Crear Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Empresa */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#2d2d2e] rounded-2xl border border-white/10 shadow-2xl p-6">
            <h2 className="text-2xl font-bold mb-6">Editar Empresa</h2>
            <form onSubmit={handleUpdateEmpresa} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre o Razón Social</label>
                <input 
                  type="text" 
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">NIT</label>
                <input 
                  type="text" 
                  required
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
                <select 
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white outline-none transition-colors appearance-none"
                >
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                </select>
              </div>
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/10">
                <button 
                  type="button"
                  onClick={(e) => handleDeleteEmpresa(e, editingEmpresaId)}
                  className="px-4 py-2 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-trash"></i> Eliminar
                </button>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded-lg bg-orange-500 text-white font-semibold shadow-lg shadow-orange-500/20 ${isSubmitting ? 'opacity-70' : 'hover:bg-orange-600'}`}
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upgrade Plan */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-[#2d2d2e] rounded-2xl border border-white/10 shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Mejora tu Plan</h2>
              {userPlan !== 'Demo' || maxEmpresas > 0 ? (
              <button onClick={() => setIsUpgradeModalOpen(false)} className="text-gray-400 hover:text-white text-xl">
                &times;
              </button>
            ) : null}
            </div>
            
            <p className="text-gray-300 mb-8">
              {maxEmpresas === 0 && userPlan === 'Demo' 
                ? "⏱️ Tu periodo de prueba gratuita de 30 días ha finalizado. Por favor, selecciona un plan para continuar usando HATHAX."
                : `Has alcanzado el límite de ${maxEmpresas} empresas de tu plan ${userPlan}. Selecciona un nuevo plan para seguir creciendo:`}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Plan Starter */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-center">
                <h3 className="text-xl font-bold text-gray-300">Starter</h3>
                <p className="text-sm text-gray-400 mb-4">Ideal para comenzar</p>
                <div className="text-3xl font-bold text-white mb-4">$50.000 <span className="text-sm font-normal text-gray-400">COP</span></div>
                <ul className="text-sm text-gray-300 space-y-2 mb-6">
                  <li>3 Empresas</li>
                  <li>Soporte básico</li>
                </ul>
                {userPlan === 'Demo' ? (
                  <a href={`https://wa.me/573222476829?text=Hola,%20quiero%20el%20plan%20Starter.%20Mi%20correo%20es%20${auth.currentUser?.email}`} target="_blank" rel="noopener noreferrer" className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold transition-colors">
                    Adquirir Plan
                  </a>
                ) : (
                  <div className="px-4 py-2 bg-gray-600 rounded-lg text-white opacity-50 cursor-not-allowed">Plan Actual</div>
                )}
              </div>

              {/* Plan Business */}
              <div className="bg-orange-500/10 border border-orange-500/50 p-6 rounded-xl text-center relative shadow-lg shadow-orange-500/10">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">RECOMENDADO</div>
                <h3 className="text-xl font-bold text-orange-400">Business</h3>
                <p className="text-sm text-gray-400 mb-4">Para contadores</p>
                <div className="text-3xl font-bold text-white mb-4">$400.000 <span className="text-sm font-normal text-gray-400">COP</span></div>
                <ul className="text-sm text-gray-300 space-y-2 mb-6">
                  <li>20 Empresas</li>
                  <li>Soporte prioritario</li>
                </ul>
                <a href={`https://wa.me/573222476829?text=Hola,%20quiero%20el%20plan%20Business.%20Mi%20correo%20es%20${auth.currentUser?.email}`} target="_blank" rel="noopener noreferrer" className="block w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-bold transition-colors">
                  Contactar Asesor
                </a>
              </div>

              {/* Plan Enterprise */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-center">
                <h3 className="text-xl font-bold text-purple-400">Enterprise</h3>
                <p className="text-sm text-gray-400 mb-4">Firmas grandes</p>
                <div className="text-3xl font-bold text-white mb-4">$600.000 <span className="text-sm font-normal text-gray-400">COP</span></div>
                <ul className="text-sm text-gray-300 space-y-2 mb-6">
                  <li>Empresas ilimitadas</li>
                  <li>Funciones premium</li>
                </ul>
                <a href={`https://wa.me/573222476829?text=Hola,%20quiero%20el%20plan%20Enterprise.%20Mi%20correo%20es%20${auth.currentUser?.email}`} target="_blank" rel="noopener noreferrer" className="block w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-bold transition-colors">
                  Contactar Asesor
                </a>
              </div>
            </div>

            <div className="bg-white/5 p-6 rounded-xl flex items-center gap-6">
              <div className="flex-1">
                <h4 className="font-bold text-white mb-2">¿Cómo pagar?</h4>
                <p className="text-sm text-gray-400">Escanea el código QR de Bancolombia o Nequi, realiza la transferencia y envíanos el comprobante por WhatsApp presionando el botón "Contactar Asesor". Activaremos tu plan de inmediato.</p>
              </div>
              <div className="w-56 h-auto bg-white rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg p-2">
                <img src="/qr-pago.jpg" alt="QR Bancolombia Bre-B" className="w-full h-auto object-contain rounded" />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
