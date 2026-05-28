# Instalación — Encuesta staff ALPHA impacto

## Publicar (sin que el usuario autorice nada)

1. **Extensiones** → **Apps Script** → pegar `Code.gs` y `Index`.
2. **Implementar** → **Nueva implementación** → **Aplicación web**:
   - **Ejecutar como:** Yo
   - **Quién tiene acceso:** Cualquier usuario
3. Copiar la URL y compartirla.

Con esta configuración **no aparece** la pantalla de “Google quiere acceder a tu cuenta”.

---

## ¿Se puede obtener el e-mail en silencio?

**No**, si usás *Ejecutar como: Yo* + *Cualquier usuario*.

Google **bloquea por diseño** que una web app lea el correo del visitante, el historial, las cuentas guardadas en Chrome o la sesión de Gmail **sin** que el usuario autorice explícitamente la app. Eso no es un límite del código: es política de seguridad de Google (evitar rastreo encubierto).

| Método | ¿Pide autorización? | ¿Da e-mail real? |
|--------|---------------------|------------------|
| Ejecutar como: Yo + Cualquiera | No | Casi nunca |
| Ejecutar como: Usuario que accede | **Sí** (primera vez) | Sí, si acepta |
| Leer “caché” del navegador / cuentas Google | No permitido | Imposible en Apps Script |

---

## Qué guarda la columna `e-mail` (automático, sin mostrar nada en pantalla)

Orden de prioridad:

1. **`?t=TOKEN` en el enlace** → si tenés pestaña `staff`, se guarda el e-mail real (ver abajo).
2. **E-mail de Google** → solo si Google lo expone (raro con tu configuración).
3. **`sesion:xxxx`** → identificador anónimo de Google para esa visita/navegador.
4. **`device:xxxx`** → ID guardado en el navegador (mismo celular/PC = mismo valor en futuros envíos).
5. **`[NULL]`** → no se pudo identificar nada.

Con `device:` y `sesion:` podés ver **si varias filas son la misma persona**, aunque no sepas su correo.

---

## Opción recomendada si querés e-mail real SIN pantalla de autorización

Enlaces **personalizados** por persona (un mensaje de WhatsApp con su link; ellos no ven el e-mail).

1. Creá pestaña **`staff`** en la misma hoja:

   | token | e-mail |
   |-------|--------|
   | ana01 | ana@gimnasio.com |
   | luis02 | luis@gimnasio.com |

2. Generá tokens únicos (cualquier texto corto).
3. Compartí a cada uno:  
   `https://script.google.com/macros/s/XXXX/exec?t=ana01`

El formulario se ve igual; en `Analisis` se guarda su e-mail sin preguntar ni autorizar.

---

## Pestañas obligatorias

- `Analisis` — id_a, fecha, id_tema, id_pregunta, calificacion, e-mail, texto
- `tema`
- `preguntas`

Opcional: `staff` (token, e-mail)

---

## Promedios en la hoja

Excluir respuestas abiertas (P14 = calificación 0):

```excel
=PROMEDIO.SI(E:E;">0";E:E)
```

(Ajustá la columna si `calificacion` no está en E.)
