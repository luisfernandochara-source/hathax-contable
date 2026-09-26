'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Guardar datos de facturación en Firestore
        await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
          email: email,
          nombre: nombre,
          nit: nit,
          plan: 'Demo',
          maxEmpresas: 1,
          createdAt: serverTimestamp()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Credenciales incorrectas o usuario no encontrado.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado. Intenta iniciar sesión.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Error de red. Verifica tu conexión a internet.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Intenta más tarde.');
      } else {
        setError(`Ocurrió un error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-white bg-[#0a0a0a]">
      
      {/* Sección Izquierda (Marketing / Información) */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Bienvenido a la evolución de tu firma contable.
          </h2>
          <p className="text-lg text-gray-400 mb-6">
            Gestiona tus clientes con nuestra plataforma contable inteligente. Una solución <strong className="text-orange-400">100% en la Nube (SaaS)</strong> sin instalaciones, siempre actualizada y disponible desde cualquier lugar.
          </p>
          <ul className="text-gray-400 space-y-3 mb-8">
            <li className="flex items-center gap-2"><i className="fa-solid fa-check text-green-500"></i> Infraestructura escalable de Google Cloud</li>
            <li className="flex items-center gap-2"><i className="fa-solid fa-check text-green-500"></i> Facturación como servicio excluido de IVA (SaaS)</li>
            <li className="flex items-center gap-2"><i className="fa-solid fa-check text-green-500"></i> Procesamiento y seguridad de primer nivel</li>
          </ul>
          <div className="flex gap-4 items-center opacity-50">
            {/* Espacio para logos de integraciones (DIAN, etc.) a futuro */}
          </div>
        </div>

        {/* Datos de contacto */}
        <div className="absolute bottom-8 left-16 z-10 flex flex-col md:flex-row gap-4 md:gap-12 text-sm text-gray-400 font-medium">
          <a href="mailto:contacto@hathax.com" className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
            <i className="fa-regular fa-envelope text-lg"></i>
            contacto@hathax.com
          </a>
          <a href="https://wa.me/573222476829" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
            <i className="fa-brands fa-whatsapp text-lg"></i>
            @hathax
          </a>
        </div>
      </div>

      {/* Sección Derecha (Login Form) */}
      <div className="w-full lg:w-[500px] xl:w-[600px] flex items-center justify-center p-8 md:p-12 border-l border-white/5 shadow-2xl" style={{ backgroundColor: '#2d2d2e' }}>
        <div className="w-full max-w-md">
          
          {/* Logo */}
          <div className="text-center -mt-8 -mb-12 relative z-0 pointer-events-none">
            <div className="inline-flex items-center justify-center">
              <Image priority={true} src="/brand/logo.png" alt="HATHAX Logo" width={400} height={160} className="h-40 md:h-52 w-auto object-contain scale-[1.8] translate-x-6 -translate-y-4" />
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {isRegistering && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre o Razón Social</label>
                  <input 
                    type="text" 
                    required={isRegistering}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors text-white placeholder-gray-500 outline-none"
                    placeholder="Tu Empresa S.A.S"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">NIT / Cédula</label>
                  <input 
                    type="text" 
                    required={isRegistering}
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors text-white placeholder-gray-500 outline-none"
                    placeholder="900123456-7"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Correo Electrónico</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors text-white placeholder-gray-500 outline-none"
                placeholder="tu@empresa.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors text-white placeholder-gray-500 outline-none"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            
            <div className="flex justify-end">
              <a href="#" className="text-sm text-orange-400 hover:text-orange-300 transition-colors">¿Olvidaste tu contraseña?</a>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg bg-orange-500 text-white font-semibold transition-all duration-200 shadow-lg shadow-orange-500/20 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-orange-600 hover:shadow-orange-500/40'}`}
            >
              {loading ? 'Cargando...' : isRegistering ? 'Crear Cuenta Gratis' : 'Iniciar Sesión'}
            </button>
          </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'} 
              <button 
                type="button" 
                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                className="ml-2 text-orange-500 hover:text-orange-400 font-semibold"
              >
                {isRegistering ? 'Inicia sesión aquí' : 'Crea una cuenta gratis'}
              </button>
            </div>
            
            {isRegistering && (
              <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-gray-500 leading-relaxed">
                Al crear una cuenta, aceptas nuestra modalidad de <strong className="text-gray-400">Suscripción a Servicio en la Nube (SaaS)</strong> y nuestros <a href="#" className="underline hover:text-gray-300">Términos y Condiciones</a>.
              </div>
            )}


        </div>
      </div>

    </div>
  );
}
