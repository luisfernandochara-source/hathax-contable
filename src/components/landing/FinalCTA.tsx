import Link from "next/link";

export default function FinalCTA() {
  return (
    <section id="contacto" style={{ paddingTop: 0 }}>
      <div className="w">
        <div className="final">
          <h2>Lleva tu firma a la nube hoy</h2>
          <p>Automatiza tus procesos y recupera tu tiempo libre.</p>
          <Link className="btn" href="/login">Crear cuenta gratis</Link>
        </div>
      </div>
    </section>
  );
}
