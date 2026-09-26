const features = [
  { icon: "▦", title: "Gestión multi-empresa", text: "Administra la información de todos tus clientes desde un solo panel de control centralizado." },
  { icon: "✦", title: "Contabilidad inteligente", text: "Transforma facturas XML en asientos contables y Excel automáticamente aplicando tus propias reglas." },
  { icon: "%", title: "Retenciones PUC", text: "El sistema memoriza automáticamente las cuentas PUC y porcentajes de retención de cada tercero." },
  { icon: "⇪", title: "Exportación a Siigo", text: "Lleva los consecutivos al día y exporta tus asientos listos para cargar en Siigo." },
  { icon: "☁", title: "Acceso desde cualquier lugar", text: "Tu oficina viaja contigo. Accede a tu información financiera desde cualquier dispositivo con internet." },
  { icon: "⛨", title: "Seguridad de primer nivel", text: "Procesamiento 100% local de tus XML. La información confidencial nunca viaja a nuestros servidores." },
];

export default function Features() {
  return (
    <section id="funciones">
      <div className="w">
        <h2>Todo lo que necesitas para tu firma</h2>
        <p className="lead">
          Diseñamos HATHAX pensando en la eficiencia y la seguridad que
          requieren los contadores colombianos.
        </p>
        <div className="grid">
          {features.map((f) => (
            <div className="card" key={f.title}>
              <div className="ic">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
