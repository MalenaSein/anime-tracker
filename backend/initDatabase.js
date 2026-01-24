// backend/initDatabase.js
const db = require('./config/database');

async function initDatabase() {
  try {
    console.log('🔧 Inicializando base de datos...');

    // ============================================
    // 1️⃣ VERIFICAR SI LAS TABLAS YA EXISTEN
    // ============================================
    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME IN ('usuarios', 'animes')
    `);

    const existingTables = tables.map(t => t.TABLE_NAME);
    const usuariosExists = existingTables.includes('usuarios');
    const animesExists = existingTables.includes('animes');

    // ============================================
    // 2️⃣ CREAR TABLA USUARIOS (solo si no existe)
    // ============================================
    if (!usuariosExists) {
      await db.query(`
        CREATE TABLE usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          email VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_username (username)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Tabla "usuarios" creada');
    } else {
      console.log('✅ Tabla "usuarios" ya existe');
    }

    // ============================================
    // 3️⃣ CREAR TABLA ANIMES (solo si no existe)
    // ============================================
    if (!animesExists) {
      await db.query(`
        CREATE TABLE animes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          nombre VARCHAR(255) NOT NULL,
          imagen_url VARCHAR(500),
          tipo VARCHAR(50) DEFAULT 'Desconocido',
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
      console.log('✅ Tabla "animes" creada');
    } else {
      console.log('✅ Tabla "animes" ya existe');
    }

    console.log('🎉 Base de datos lista!');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    throw error;
  }
}

module.exports = initDatabase;