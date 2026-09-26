import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer>
      <div className="w">
        <div>
          <Link className="logo" href="/">
            <Image src="/modulo/favicon.png" alt="HATHAX" width={36} height={36} />
            HATHAX
          </Link>
          <p style={{ margin: "8px 0 0" }}>
            © 2026 HATHAX. Plataforma Contable Inteligente. Software como Servicio (SaaS).
          </p>
        </div>
        <div>
          <a href="mailto:contacto@hathax.com">contacto@hathax.com</a><br />
          <a href="https://wa.me/573222476829">+57 322 2476829</a><br />
          <a href="#">Términos y condiciones</a> · <a href="#">Política de privacidad</a>
        </div>
      </div>
    </footer>
  );
}
