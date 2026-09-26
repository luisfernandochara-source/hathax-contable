const steps = [
  { title: "Crea tu cuenta gratis", text: "Regístrate en menos de un minuto usando tu correo electrónico. Sin tarjetas de crédito." },
  { title: "Agrega tus empresas", text: "Añade los NITs de los clientes de tu firma para empezar a organizar su información de inmediato." },
  { title: "Trabaja de forma inteligente", text: "Arrastra los archivos XML y deja que nuestra plataforma haga los asientos contables por ti." },
];

export default function Steps() {
  return (
    <section id="como-funciona" style={{ paddingTop: 0 }}>
      <div className="w">
        <h2>Comienza en tres pasos simples</h2>
        <p className="lead">
          No necesitas descargar instaladores ni hacer configuraciones complejas.
        </p>
        <ol className="steps">
          {steps.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
