/**
 * Encuesta staff ALPHA impacto
 *
 * Publicación recomendada (sin pantalla de autorización para el usuario):
 *   Ejecutar como: Yo
 *   Quién tiene acceso: Cualquier usuario
 *
 * IMPORTANTE — Google no permite leer el e-mail del visitante en este modo.
 * No existe acceso al historial, cuentas en caché ni sesión de Chrome desde Apps Script.
 * La columna e-mail usará, en este orden: token en URL → e-mail (solo si Google lo expone) →
 * sesion:... → device:... (mismo navegador) → [NULL]
 */

var HOJA_ANALISIS = 'Analisis';
var HOJA_PREGUNTAS = 'preguntas';
var HOJA_STAFF = 'staff'; // opcional: token | e-mail
var ID_PREGUNTA_ABIERTA = 'P14';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Encuesta staff ALPHA impacto')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function obtenerPreguntasEncuesta() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_PREGUNTAS);
  if (!sheet) {
    throw new Error('No se encontró la pestaña "' + HOJA_PREGUNTAS + '".');
  }

  var data = sheet.getDataRange().getValues();
  var porTema = {};

  for (var i = 1; i < data.length; i++) {
    var idTema = data[i][0];
    var idPregunta = data[i][1];
    var textoPregunta = data[i][2];
    if (idTema === '' || idPregunta === '') continue;

    var claveTema = String(idTema);
    if (!porTema[claveTema]) porTema[claveTema] = [];

    porTema[claveTema].push({
      id_tema: idTema,
      id_pregunta: String(idPregunta),
      pregunta: String(textoPregunta),
      esTexto: String(idPregunta).toUpperCase() === ID_PREGUNTA_ABIERTA
    });
  }

  var seleccionadas = [];
  var temas = Object.keys(porTema);
  for (var t = 0; t < temas.length; t++) {
    var opciones = porTema[temas[t]];
    var indice = Math.floor(Math.random() * opciones.length);
    seleccionadas.push(opciones[indice]);
  }

  return mezclarArray(seleccionadas);
}

/**
 * @param {Object} payload
 * @param {Array} payload.respuestas
 * @param {string} [payload.dispositivoId] ID guardado en localStorage del navegador
 * @param {string} [payload.tokenUrl] valor del parámetro ?t= en el enlace (links personalizados)
 */
function guardarEncuesta(payload) {
  var respuestas = payload && payload.respuestas ? payload.respuestas : payload;
  if (!respuestas || respuestas.length === 0) {
    throw new Error('No hay respuestas para guardar.');
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_ANALISIS);
  if (!sheet) {
    throw new Error('No se encontró la pestaña "' + HOJA_ANALISIS + '".');
  }

  var identificador = obtenerIdentificadorUsuario(
    payload ? payload.dispositivoId : '',
    payload ? payload.tokenUrl : ''
  );

  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var siguienteId = obtenerMaxIdA(sheet) + 1;
    var ahora = new Date();
    var filas = [];

    for (var i = 0; i < respuestas.length; i++) {
      var r = respuestas[i];
      var esTexto = String(r.id_pregunta).toUpperCase() === ID_PREGUNTA_ABIERTA;
      var calificacion = esTexto ? 0 : Number(r.calificacion);
      var texto = esTexto ? String(r.texto || '').trim() : '';

      if (!esTexto && (isNaN(calificacion) || calificacion < 1 || calificacion > 5)) {
        throw new Error('Calificación inválida en la pregunta ' + r.id_pregunta + '.');
      }
      if (esTexto && !texto) {
        throw new Error('Completá la respuesta abierta antes de enviar.');
      }

      filas.push([
        siguienteId + i,
        ahora,
        r.id_tema,
        r.id_pregunta,
        calificacion,
        identificador,
        texto
      ]);
    }

    var filaInicio = sheet.getLastRow() + 1;
    // 3er y 4to parámetro = cantidad de filas y columnas (no fila final)
    sheet.getRange(filaInicio, 1, filas.length, 7).setValues(filas);
  } finally {
    lock.releaseLock();
  }

  return { ok: true, filasGuardadas: respuestas.length };
}

function obtenerIdentificadorUsuario(dispositivoId, tokenUrl) {
  // 1) Enlace personalizado ?t=TOKEN → e-mail real sin pedir nada en pantalla
  if (tokenUrl) {
    var porToken = resolverEmailPorToken(String(tokenUrl).trim());
    if (porToken) return porToken;
  }

  // 2) E-mail del visitante (casi siempre vacío con "Ejecutar como: Yo" + "Cualquier usuario")
  try {
    var emailActivo = Session.getActiveUser().getEmail();
    var normalizado = normalizarEmail(emailActivo);
    if (normalizado) return normalizado;
  } catch (e) { /* sin permiso */ }

  // NO usar getEffectiveUser(): con "Ejecutar como: Yo" devuelve TU correo, no el del visitante.

  // 3) Huella de sesión que da Google sin autorización (mismo visitante suele repetir valor)
  try {
    var claveSesion = Session.getTemporaryActiveUserKey();
    if (claveSesion) return 'sesion:' + claveSesion;
  } catch (e) { /* no disponible */ }

  // 4) ID persistente del navegador (localStorage), sin pantallas ni permisos
  if (esDispositivoIdValido(dispositivoId)) {
    return 'device:' + dispositivoId;
  }

  return '[NULL]';
}

/**
 * Pestaña opcional "staff": columna A = token, columna B = e-mail
 * Enlace por persona: https://script.google.com/.../exec?t=TOKEN_UNICO
 */
function resolverEmailPorToken(token) {
  if (!token) return '';

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HOJA_STAFF);
  if (!sheet) return '';

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === token) {
      return normalizarEmail(data[i][1]);
    }
  }
  return '';
}

function esDispositivoIdValido(id) {
  if (!id || typeof id !== 'string') return false;
  return /^[a-zA-Z0-9_-]{16,64}$/.test(id.trim());
}

function obtenerMaxIdA(sheet) {
  var ultimaFila = sheet.getLastRow();
  if (ultimaFila < 2) return 0;

  var numFilas = ultimaFila - 1;
  var ids = sheet.getRange(2, 1, numFilas, 1).getValues();
  var maxId = 0;
  for (var i = 0; i < ids.length; i++) {
    var n = parseInt(ids[i][0], 10);
    if (!isNaN(n) && n > maxId) maxId = n;
  }
  return maxId;
}

function normalizarEmail(email) {
  if (!email || typeof email !== 'string') return '';
  var limpio = email.trim().toLowerCase();
  if (!limpio || limpio.indexOf('@') === -1) return '';
  return limpio;
}

function mezclarArray(arr) {
  var copia = arr.slice();
  for (var i = copia.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = copia[i];
    copia[i] = copia[j];
    copia[j] = temp;
  }
  return copia;
}
