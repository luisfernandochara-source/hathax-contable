export default function ProductPreview() {
  return (
    <div className="app" aria-label="Vista de la plataforma">
      <div className="bar">
        <i></i><i></i><i></i>
        <span>hathax.com/dashboard</span>
      </div>
      <div className="ab">
        <div className="tabs">
          <span className="on">Compras</span>
          <span>Ventas</span>
          <span>Terceros</span>
          <span>Reglas</span>
        </div>
        <div className="stp">
          <div className="on"><b>1</b><small>Revisar</small></div>
          <div><b>2</b><small>Asientos</small></div>
          <div><b>3</b><small>Retenciones</small></div>
          <div><b>4</b><small>Exportar Siigo</small></div>
        </div>
        <div className="tb">
          <div className="th"><span>Folio</span><span>Tercero</span><span>Total</span><span>Regla</span></div>
          <div className="tr">
            <b>FEV18…</b>
            <span className="t">Luis Fernando Char…</span>
            <span>1.584.000</span>
            <span className="pill">Compras</span>
          </div>
          <div className="tr">
            <b>F1037…</b>
            <span className="t">Cirion Technologies…</span>
            <span>31.588.550</span>
            <span className="pill">Compras</span>
          </div>
          <div className="tr">
            <span className="pill g">✓ Asiento cuadrado</span>
            <span>8 documentos</span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
