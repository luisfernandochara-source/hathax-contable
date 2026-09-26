import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav>
      <Link className="logo" href="/">
        <Image src="/modulo/favicon.png" alt="HATHAX" width={68} height={68} />
        HATHAX
      </Link>
      <div className="links">
        <a href="#funciones">Funciones</a>
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#contacto">Contacto</a>
        <Link className="btn" href="/login">Crear cuenta gratis</Link>
      </div>
    </nav>
  );
}
