import Link from "next/link";
import ProductPreview from "./ProductPreview";

export default function Hero() {
  return (
    <header className="hero">
      <div>
        <h1>Toda tu firma contable en <em>una sola plataforma.</em></h1>
        <p>
          Trabaja 100% en la nube, sin instalaciones ni descargas. Gestiona
          múltiples empresas, automatiza tus asientos y exporta directo a Siigo.
        </p>
        <div className="cta">
          <Link className="btn" href="/login">Crear cuenta gratis</Link>
          <a className="btn o" href="https://wa.me/573222476829">Hablar por WhatsApp</a>
        </div>
      </div>
      <ProductPreview />
    </header>
  );
}
