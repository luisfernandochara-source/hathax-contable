const items = [
  "100% en la nube",
  "Gestión multi-empresa",
  "Exporta a Siigo",
  "Seguridad Google Cloud",
  "Servicio SaaS excluido de IVA",
];

export default function TrustBand() {
  return (
    <div className="band">
      <div className="w">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}
