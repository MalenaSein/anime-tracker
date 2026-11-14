const {
  isNonEmptyString,
  toInteger,
  isValidEstado
} = require('./validation');

const ESTADO_MAP = {
  visto: 'completado',
  completado: 'completado',
  viendo: 'viendo',
  abandonado: 'abandonado',
  'por ver': 'por_ver',
  por_ver: 'por_ver',
  pausado: 'pausado'
};

function normalizeAnimeImport(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return { ok: false, error: 'Formato de anime inválido' };
  }

  const { nombre, tipo, estado, calificacion, capitulos_vistos } = item;

  if (!isNonEmptyString(nombre)) {
    return { ok: false, error: 'El nombre es obligatorio' };
  }

  const nombreLimpio = nombre.trim();
  if (nombreLimpio.length > 255) {
    return { ok: false, error: 'El nombre supera los 255 caracteres' };
  }

  const estadoRaw = isNonEmptyString(estado) ? estado.trim() : 'viendo';
  const estadoNormalizado = ESTADO_MAP[estadoRaw.toLowerCase()] || estadoRaw;

  if (!isValidEstado(estadoNormalizado)) {
    return { ok: false, error: `Estado inválido: ${estadoRaw}` };
  }

  const capsRaw = capitulos_vistos === undefined || capitulos_vistos === null || capitulos_vistos === ''
    ? 0
    : toInteger(capitulos_vistos);

  if (capsRaw === null || capsRaw < 0) {
    return { ok: false, error: 'capitulos_vistos debe ser un entero mayor o igual a 0' };
  }

  let rating = null;
  if (calificacion !== undefined && calificacion !== null && calificacion !== '') {
    rating = toInteger(calificacion);
    if (rating === null || rating < 0 || rating > 5) {
      return { ok: false, error: 'calificacion debe ser un entero entre 0 y 5' };
    }
  }

  const tipoLimpio = isNonEmptyString(tipo) ? tipo.trim().slice(0, 50) : 'Desconocido';

  return {
    ok: true,
    value: {
      nombre: nombreLimpio,
      tipo: tipoLimpio,
      estado: estadoNormalizado,
      calificacion: rating,
      capitulos_vistos: capsRaw
    }
  };
}

module.exports = { normalizeAnimeImport, ESTADO_MAP };