const fetch = require('node-fetch');

// ============================================
// SERVICIO PARA OBTENER IMÁGENES DE ANIME
// ============================================
// Usamos la API de Jikan (MyAnimeList API) que es gratuita y no requiere API key

/**
 * Busca un anime en MyAnimeList y retorna su imagen de portada
 * @param {string} nombreAnime - Nombre del anime a buscar
 * @returns {Promise<string|null>} - URL de la imagen o null si no se encuentra
 */
async function obtenerImagenAnime(nombreAnime) {
  try {
    console.log(`🔍 Buscando imagen para: ${nombreAnime}`);

    // API de Jikan (MyAnimeList) - Completamente gratuita
    // Documentación: https://docs.api.jikan.moe/
    const searchUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(nombreAnime)}&limit=1`;

    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.log('⚠️ Error en la búsqueda de imagen');
      return null;
    }

    const data = await response.json();

    // Si encontramos resultados, tomamos la primera imagen
    if (data.data && data.data.length > 0) {
      const anime = data.data[0];
      const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
      
      if (imageUrl) {
        console.log(`✅ Imagen encontrada: ${imageUrl}`);
        return imageUrl;
      }
    }

    console.log('⚠️ No se encontró imagen para este anime');
    return null;

  } catch (error) {
    console.error('❌ Error obteniendo imagen:', error.message);
    return null;
  }
}

/**
 * Imagen por defecto si no se encuentra ninguna
 */
function obtenerImagenPorDefecto() {
  // Imagen placeholder de anime genérica
  return 'https://via.placeholder.com/225x350/9333ea/ffffff?text=Anime';
}

module.exports = {
  obtenerImagenAnime,
  obtenerImagenPorDefecto
};