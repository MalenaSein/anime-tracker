// backend/initDatabase.js
const db = require('./config/database');

async function initDatabase() {
  try {
    console.log('🔧 Inicializando base de datos...');

    // 1️⃣ CREAR TABLA DE USUARIOS
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

    // 2️⃣ CREAR TABLA DE ANIMES (si no existe)
    await db.query(`
      CREATE TABLE IF NOT EXISTS animes (
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
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 3️⃣ VERIFICAR SI LA COLUMNA 'tipo' ES ENUM (estructura antigua)
    const [columns] = await db.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'animes' 
        AND COLUMN_NAME = 'tipo'
    `);

    // 4️⃣ SI ES ENUM, CONVERTIRLA A VARCHAR SIN BORRAR DATOS
    if (columns.length > 0 && columns[0].COLUMN_TYPE.startsWith('enum')) {
      console.log('🔄 Migrando columna "tipo" de ENUM a VARCHAR...');
      
      await db.query(`
        ALTER TABLE animes 
        MODIFY COLUMN tipo VARCHAR(50) DEFAULT 'Desconocido'
      `);
      
      console.log('✅ Migración completada - DATOS PRESERVADOS');
    }

    console.log('✅ Tabla "animes" verificada');
    console.log('🎉 Base de datos lista!');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    throw error;
  }
}

module.exports = initDatabase;