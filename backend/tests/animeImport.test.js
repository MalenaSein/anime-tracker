const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeAnimeImport } = require('../utils/animeImport');

test('normaliza un anime completo', () => {
  const result = normalizeAnimeImport({
    nombre: '  Erased  ',
    tipo: 'Seinen',
    estado: 'Visto',
    calificacion: 5,
    capitulos_vistos: 12
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    nombre: 'Erased',
    tipo: 'Seinen',
    estado: 'completado',
    calificacion: 5,
    capitulos_vistos: 12
  });
});

test('mapea estados en español y usa valores por defecto', () => {
  const result = normalizeAnimeImport({
    nombre: 'Por ver',
    estado: 'Por Ver'
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.estado, 'por_ver');
  assert.equal(result.value.tipo, 'Desconocido');
  assert.equal(result.value.calificacion, null);
  assert.equal(result.value.capitulos_vistos, 0);
});

test('rechaza nombres vacíos y ratings inválidos', () => {
  assert.equal(normalizeAnimeImport({ nombre: '   ' }).ok, false);
  assert.equal(normalizeAnimeImport({ nombre: 'X', calificacion: 9 }).ok, false);
  assert.equal(normalizeAnimeImport({ nombre: 'X', capitulos_vistos: -1 }).ok, false);
});

test('normaliza la lista real completa del usuario', () => {
  const data = require('../../imports/animes.json');
  assert.equal(Array.isArray(data.animes), true);
  assert.equal(data.animes.length, 134);

  data.animes.forEach((anime, index) => {
    const result = normalizeAnimeImport(anime);
    assert.equal(result.ok, true, `El anime ${index + 1} es inválido: ${result.error}`);
  });
});