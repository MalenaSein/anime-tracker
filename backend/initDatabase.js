// backend/initDatabase.js
const db = require('./config/database');
async function initDatabase() {
  try {
    console.log('🔧 Inicializando base de datos...');

    // CREAR TABLA DE USUARIOS (Esta la dejamos igual)
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla "usuarios" verificada');

    // 👇 2. AQUÍ ESTÁ EL CAMBIO IMPORTANTE
    // Cambiamos 'tipo' de ENUM a VARCHAR(50) para que acepte "Shonen", "Isekai", etc.
    await db.query(`
      CREATE TABLE IF NOT EXISTS animes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        imagen_url VARCHAR(500),
        
        tipo VARCHAR(50) DEFAULT 'Desconocido',  -- <--- CAMBIO AQUÍ (Antes era ENUM)
        
        capitulos_vistos INT DEFAULT 0,
        estado ENUM('viendo', 'completado', 'pausado', 'abandonado', 'planeado') DEFAULT 'viendo',
        calificacion INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla "animes" actualizada con soporte para géneros');

    console.log('🎉 Base de datos lista!');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    throw error;
  }
}

module.exports = initDatabase;