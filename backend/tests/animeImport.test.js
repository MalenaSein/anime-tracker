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
    capitulos_vistos: 12,
    imagen_url: null
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

test('acepta una portada http(s) y rechaza URLs inválidas', () => {
  const withImage = normalizeAnimeImport({
    nombre: 'Erased',
    imagen_url: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21234-XmqW39aQ9o7O.jpg'
  });
  assert.equal(withImage.ok, true);
  assert.match(withImage.value.imagen_url, /^https:\/\//);

  assert.equal(normalizeAnimeImport({ nombre: 'X', imagen_url: 'javascript:alert(1)' }).ok, false);
  assert.equal(normalizeAnimeImport({ nombre: 'X', imagen_url: 'no-es-url' }).ok, false);
});

test('normaliza la lista real completa del usuario', () => {
  const data = require('../../imports/animes.json');
  assert.equal(Array.isArray(data.animes), true);
  assert.equal(data.animes.length, 134);

  data.animes.forEach((anime, index) => {
    const result = normalizeAnimeImport(anime);
    assert.equal(result.ok, true, `El anime ${index + 1} es inválido: ${result.error}`);
    assert.ok(result.value.imagen_url, `El anime ${index + 1} no tiene portada`);
  });
});