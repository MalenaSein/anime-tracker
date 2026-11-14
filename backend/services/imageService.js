const fetch = require('node-fetch');

// ============================================
// SERVICIO PARA OBTENER IMÁGENES DE ANIME
// ============================================
// AniList es la fuente principal (búsqueda más confiable y sin rate limit
// tan agresivo). Jikan/MyAnimeList queda como fallback.

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function obtenerImagenAniList(nombreAnime) {
  try {
    const query = `
      query ($search: String) {
        Media(search: $search, type: ANIME) {
          coverImage {
            extraLarge
            large
          }
        }
      }
    `;

    const response = await fetchWithTimeout('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { search: nombreAnime } })
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data?.Media?.coverImage?.extraLarge ||
      data.data?.Media?.coverImage?.large ||
      null;
  } catch (error) {
    console.error('❌ Error obteniendo imagen de AniList:', error.message);
    return null;
  }
}

async function obtenerImagenJikan(nombreAnime) {
  try {
    const searchUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(nombreAnime)}&limit=1`;
    const response = await fetchWithTimeout(searchUrl);

    if (!response.ok) return null;

    const data = await response.json();
    const anime = data.data?.[0];
    return anime?.images?.jpg?.large_image_url || anime?.images?.jpg?.image_url || null;
  } catch (error) {
    console.error('❌ Error obteniendo imagen de Jikan:', error.message);
    return null;
  }
}

/**
 * Busca un anime y retorna la URL de su portada.
 * @param {string} nombreAnime - Nombre del anime a buscar
 * @returns {Promise<string|null>} - URL de la imagen o null si no se encuentra
 */
async function obtenerImagenAnime(nombreAnime) {
  console.log(`🔍 Buscando imagen para: ${nombreAnime}`);

  const aniListImage = await obtenerImagenAniList(nombreAnime);
  if (aniListImage) {
    console.log(`✅ Imagen encontrada (AniList): ${aniListImage}`);
    return aniListImage;
  }

  const jikanImage = await obtenerImagenJikan(nombreAnime);
  if (jikanImage) {
    console.log(`✅ Imagen encontrada (Jikan): ${jikanImage}`);
    return jikanImage;
  }

  console.log('⚠️ No se encontró imagen para este anime');
  return null;
}

/**
 * Imagen por defecto si no se encuentra ninguna
 */
function obtenerImagenPorDefecto() {
  return 'https://placehold.co/225x350/9333ea/ffffff?text=Anime';
}

module.exports = {
  obtenerImagenAnime,
  obtenerImagenPorDefecto
};