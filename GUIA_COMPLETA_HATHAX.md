# GUÍA COMPLETA DE MEJORA — HATHAX
## Para un contador que construye su SaaS con IA
**Fecha:** 2026-09-26 · **Tiempo estimado total:** 6-10 semanas · **Presupuesto contratado estimado:** $200–600 USD

### 🗺️ CÓMO LEER ESTE DOCUMENTO
Cada tarea tiene una etiqueta:
- 🤖 **CON IA** → Puedes hacerlo tú pegándole las instrucciones a Antigravity / ChatGPT / Claude
- 🤝 **CON IA + REVISIÓN** → La IA lo hace, pero alguien con criterio técnico debe validarlo (puede ser una consulta puntual, no un empleado)
- 👷 **CONTRATAR** → Necesitas un ingeniero freelance. Incluye texto listo para publicar la oferta.

**Regla de oro:** nunca avances a la siguiente fase sin probar la anterior de punta a punta.

---

# FASE 0 — SEGURIDAD CRÍTICA (Semana 1-2)
## 🔴 Objetivo: que nadie pueda entrar sin login ni ver datos de otros clientes

### Tarea 0.1 — Cerrar el bypass del iframe
**Etiqueta: 👷 CONTRATAR (o 🤝 con revisión muy cuidadosa)**

**El problema:** existe un script que muestra toda la app si la URL tiene `?empresaId=loque sea`, sin pedir contraseña. Ya revisamos que `hathax.com/dashboard/empresa?id=...` redirige bien, pero el módulo (`index.html`) tiene este hueco.

**Paso a paso:**
1. Abre `index.html` y busca el bloque que dice `HACK PARA IFRAME (v2)`
2. Bórralo completo
3. Si la app se usa dentro de un iframe desde hathax.com, el reemplazo correcto es autenticación por token (el padre envía el login del usuario, el hijo lo verifica). Esto es delicado: **pregúntale a tu freelance que te lo haga y te explique**
4. Prueba: abre `tu-app.html?empresaId=123` → debe mandarte al login

**Por qué contratar y no IA:** la IA puede borrar el bloque, pero si lo reemplaza mal puedes dejar la app rota O aún vulnerable. Son 2-4 horas de freelance.

---

### Tarea 0.2 — Auditar reglas de Firestore (el muro entre clientes)
**Etiqueta: 👷 CONTRATAR — es LA inversión más importante de todo el proyecto**

**El problema:** tus datos viven en Firebase. Las "reglas de seguridad" son el único muro entre la empresa A y la empresa B. Si están mal escritas, un usuario cambia un ID en la URL y ve los datos de otro. Esto es lo que se conoce como IDOR.

**Paso a paso (lo hace el freelance, tú supervisas):**
1. Pídele que revise el archivo `firestore.rules` (está en tu proyecto Firebase)
2. Debe confirmar que TODA lectura/escritura filtra por el UID del usuario autenticado
3. Que pruebe con DOS cuentas de prueba: entrar con la cuenta 1 y tratar de abrir datos de la cuenta 2 cambiando IDs en la URL
4. Que te entregue un documento de una página con: qué encontró, qué corrigió, y cómo probarlo tú mismo

**Presupuesto:** 3-6 horas · **$50–150 USD**

---

### Tarea 0.3 — Verificar que no haya claves expuestas
**Etiqueta: 🤝 CON IA + REVISIÓN**

**Paso a paso:**
1. Abre tu app → F12 → pestaña Network → recarga
2. Busca requests a `firestore.googleapis.com` — eso es normal
3. Lo que NO es normal: ver API keys de terceros, tokens de Siigo, o contraseñas en el código visible (F12 → Sources)
4. Pégale a la IA: "revisa este main.js y dime si hay secretos que deberían estar solo en el servidor"
5. Si encuentras algo → muévelo a Firebase (el freelance de 0.2 te lo confirma)

---

### Tarea 0.4 — Política de contraseñas y bloqueo
**Etiqueta: 🤖 CON IA**

Firebase ya bloquea por intentos fallidos (`auth/too-many-requests` — ya lo tienes). Pídele a la IA:
- Mensaje de error genérico en login (que no diga si el correo existe o no — actualmente distingue "usuario no encontrado" de "contraseña incorrecta", eso ayuda a hackers a adivinar correos)
- Agregar opción "mostrar contraseña" (ojito) en el campo

---

# FASE 1 — SANITIZACIÓN ANTI-XSS (Semana 2-3)
## 🟠 Objetivo: que un XML malicioso no pueda ejecutar código en tu app

### Tarea 1.1 — Crear la utilidad de escape
**Etiqueta: 🤖 CON IA**

**Paso a paso:**
1. Pídele a Antigravity: "Crea un archivo `src/utils/sanitize.js` con una función `esc()` que escape caracteres HTML (& < > " ') y úsala en TODOS los puntos donde datos de XML se insertan al DOM con innerHTML"
2. Los puntos críticos: tabla de previsualización, tabla de retenciones, tabla de terceros, nombres de proveedores en cualquier lado

### Tarea 1.2 — Prueba de ataque
**Etiqueta: 🤖 CON IA (tú mismo, es fácil)**

**Paso a paso:**
1. Crea un XML de prueba donde el nombre del proveedor sea: `Test <img src=x onerror=alert(1)>`
2. Cárgalo en la app
3. Si sale una alerta → el hueco sigue abierto, dile a la IA dónde pasó
4. Si solo se ve el texto feo → Fase 1 cumplida

### Tarea 1.3 — Content Security Policy
**Etiqueta: 🤝 CON IA + REVISIÓN**

Pídele a la IA que agregue el meta tag CSP que está en el documento anterior. Ojo: puede que Firebase necesite ajustes; si la app deja de cargar, dile a la IA qué error sale en consola.

---

# FASE 2 — AUTENTICACIÓN ROBUSTA (Semana 3)
## 🟡 Objetivo: login serio, sin spinners infinitos ni sesiones rotas

**Etiqueta: 🤖 CON IA — todo esta fase**

**Paso a paso (pégalo tal cual a tu agente):**

1. **Timeout del polling:** el ciclo que espera `window._fbSignIn` debe tener máximo 5 segundos. Si no responde, reactivar el botón con "Error de conexión, intenta de nuevo". Hoy queda en "Ingresando…" para siempre si Firebase falla.

2. **Sesión persistente:** usar `setPersistence` y `onAuthStateChanged`. Si el usuario cierra y abre el navegador, su sesión debe seguir viva (o expirar correctamente).

3. **Logout limpio:** al cerrar sesión debe borrarse TODO: facturas cargadas, NIT activo, tablas. Prueba: login → cargar datos → logout → login con otra cuenta → NO debe verse nada del usuario anterior.

4. **Recuperación de contraseña:** ya la tienes, pero el mensaje de éxito aparece en la caja roja de error. Pídele a la IA que ponga un estilo verde para éxito.

---

# FASE 3 — LIMPIEZA Y MARCA (Semana 3-4)
## 🟢 Objetivo: que parezca un solo producto, no un collage

**Etiqueta: 🤖 CON IA — todo esta fase**

**Paso a paso:**

1. **Unificar marca:** decide ahora: ¿la marca pública es HATHAX? Entonces: `<title>` = "HATHAX · Plataforma Contable", footer = "HATHAX © 2026 · Hecho por Chara Contadores" (tu firma como crédito, no como marca). Dile a la IA exactamente eso.

2. **Quitar elementos legacy:** los divs ocultos (`v-prev`, `v-acct`, `btn-csv`, etc.) que existen "porque el JS viejo los usa". Instrucción para la IA: "encuentra qué código JS los referencia, actualízalo, y elimina los elementos del HTML".

3. **Unificar el NIT duplicado:** hay dos indicadores de NIT (arriba y en la nav). Que quede uno solo.

4. **CSS a clases (parcial):** no migres todo de golpe. Prioriza: botones, cards, headers de sección. Instrucción: "extrae los estilos repetidos más de 3 veces a clases con nombre `.hx-`".

---

# FASE 4 — QUE SE SIENTA COMO SaaS (Semana 4-6)
## 🔵 Objetivo: cumplir la promesa de "100% en la nube"

### Tarea 4.1 — Guardado automático en Firestore
**Etiqueta: 🤖 CON IA (es la tarea grande de producto — vale la pena)**

**El problema:** hoy "Guardar sesión" descarga un JSON que el usuario debe guardar y re-subir manual. Eso contradice "100% en la nube".

**Paso a paso:**
1. Instrucción para la IA: "guarda el estado de trabajo (facturas cargadas, consecutivo, ajustes de retención) en Firestore bajo la ruta `usuarios/{uid}/sesiones/{nit}` automáticamente, con debounce de 5 segundos después de cada cambio"
2. Al entrar, la app carga la sesión activa automáticamente
3. El botón "Guardar sesión" se convierte en "Exportar respaldo (JSON)" — ya no es necesario, es opcional

**Nota:** si la app se usa embebida en iframe, esta tarea se complica (autenticación cruzada). Por eso la Fase 0.1 viene primero.

### Tarea 4.2 — Registro self-service
**Etiqueta: 🤖 CON IA**

Pantalla de registro: "¿No tienes cuenta? Crea una gratis" → Firebase Auth email+password. La IA puede generarla completa.

### Tarea 4.3 — Onboarding de 3 pasos
**Etiqueta: 🤖 CON IA**

Después del primer login: ① agregar tu primer NIT → ② cargar tus primeros XML → ③ ver tu primer asiento. Instrucción: "crea un tour de onboarding con tooltips que se dispara solo si el usuario no tiene empresas registradas".

### Tarea 4.4 — Estados vacíos amigables
**Etiqueta: 🤖 CON IA**

Cada tabla vacía debe decir qué hacer: "Carga tus primeros XML para ver las facturas aquí" con botón de acción. La IA hace esto bien si le pasas captura de cada vista vacía.

---

# FASE 5 — CONFIANZA Y VENTAS (Semana 5-6, paralelo)
## 🟣 Objetivo: que un contador desconocido te crea

**Etiqueta: 🤖 CON IA (textos y estructura) + 👷 CONTRATAR solo si quieres video**

1. **Testimonios:** consigue 2-3 contadores que la usen gratis a cambio de un testimonio honesto. La IA redacta el formato.
2. **Página de precios:** aunque sea simple: "Gratis durante beta" o un solo plan. La IA redacta.
3. **Página legal:** política de tratamiento de datos (Ley 1581 de Colombia) — **plántilla con IA, revísala con un abogado si puedes, o al menos léela tú** como contador sabes qué debe decir.
4. **Demo de 2 minutos:** graba tu pantalla usando la app con datos de ejemplo. Tú grabas con OBS (gratis), la IA te escribe el guion.

---

# RESUMEN: QUÉ CONTRATAR Y CUÁNTO

| Qué | Quién | Cuánto | Cuándo |
|---|---|---|---|
| Auditoría de reglas Firestore + cierre del bypass iframe | Freelance Firebase | $50–150 USD, 3-6h | **Antes de Fase 1** (Semana 1) |
| Revisión final de seguridad antes de clientes de pago | Mismo freelance | $50–100 USD, 2-3h | Después de Fase 4 |
| Revisión de política de datos | Abogado (opcional, 1h consulta) | $30-80 USD | Antes de cobrar |
| Todo lo demás (≈85% del trabajo) | **Tú + IA** | $0 | Semanas 1-6 |

**Dónde contratar:** Workana o Upwork, busca "Firebase security rules audit". Elige alguien con reseñas y pídele que TE EXPLIQUE qué hizo — si no sabe explicarlo, no lo contrates.

---

# ANUNCIO LISTO PARA PUBLICAR (copia y pega)

> **Título:** Auditoría de seguridad Firebase + cierre de bypass de autenticación (2-6 horas)
>
> Tengo una app web SaaS de contabilidad (Firebase Auth + Firestore, vanilla JS) ya funcionando en producción con datos sensibles de clientes. Necesito:
> 1. Revisar y corregir las reglas de seguridad de Firestore (verificar que ningún usuario pueda leer/escribir documentos de otro — prevención de IDOR)
> 2. Eliminar un bloque de código que permite ver la app sin login vía parámetro en URL, y reemplazarlo por autenticación correcta para uso embebido en iframe (postMessage + verificación de token)
> 3. Verificar que no haya claves API ni secretos expuestos en el código del frontend
> 4. Agregar Content Security Policy sin romper la app
>
> Entregables: archivo firestore.rules corregido, código del iframe arreglado, y un documento breve explicando los cambios y cómo probarlos.
>
> La app está en producción: los cambios deben hacerse sin romper la funcionalidad existente. Busco entrega en máximo 1 semana.

---

# CALENDARIO SUGERIDO

| Semana | Haces tú (con IA) | Contratas |
|---|---|---|
| 1 | Tarea 0.3, 0.4 (preparación) | **Tareas 0.1 y 0.2** (freelance) |
| 2 | Fase 1 completa | — |
| 3 | Fase 2 + Fase 3 | — |
| 4-5 | Fase 4 (la más grande) | — |
| 6 | Fase 5 + pruebas finales | Revisión final ($50-100) |

**Señales de que necesitas ingeniero permanente:** más de 30 empresas activas, integración con Siigo vía API (hoy es copiar/pegar), o cuando un bug de producción te cueste más de un día de ventas.
