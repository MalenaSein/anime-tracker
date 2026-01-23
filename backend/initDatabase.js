const db = require('./config/database');

// ============================================
// SCRIPT PARA CREAR TABLAS AUTOMÁTICAMENTE
// ============================================
// Este script crea las tablas si no existen
// Se ejecuta una vez cuando arranca el servidor

async function initDatabase() {
  try {
    console.log('🔧 Inicializando base de datos...');

    // CREAR TABLA DE USUARIOS
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
    console.log('✅ Tabla "usuarios" verificada/creada');

    // CREAR TABLA DE ANIMES
    await db.query(`
      CREATE TABLE IF NOT EXISTS animes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        imagen_url VARCHAR(500),
        tipo ENUM('anime', 'pelicula', 'ova') DEFAULT 'anime',
        capitulos_vistos INT DEFAULT 0,
        estado ENUM('viendo', 'completado', 'pausado', 'abandonado', 'planeado') DEFAULT 'viendo',
        calificacion INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_estado (estado)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla "animes" verificada/creada');

    console.log('🎉 Base de datos lista!');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    throw error;
  }
}

module.exports = initDatabase;
