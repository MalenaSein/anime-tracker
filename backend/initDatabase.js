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
        AND TABLE_NAME IN ('usuarios', 'animes', 'schedules')
    `);

    const existingTables = tables.map(t => t.TABLE_NAME);
    const usuariosExists = existingTables.includes('usuarios');
    const animesExists = existingTables.includes('animes');
    const schedulesExists = existingTables.includes('schedules');

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
      console.log('✅ Tabla "usuarios" ya existe - datos preservados');
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
          generos VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_estado (estado)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Tabla "animes" creada con todos los campos');
    } else {
      // Solo verificamos que la tabla tenga el campo generos
      const [columns] = await db.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'animes' 
          AND COLUMN_NAME = 'generos'
      `);

      if (columns.length === 0) {
        await db.query(`
          ALTER TABLE animes 
          ADD COLUMN generos VARCHAR(255)
        `);
        console.log('✅ Tabla "animes" actualizada - campo "generos" agregado');
      } else {
        console.log('✅ Tabla "animes" ya existe - todos los datos preservados');
      }
    }

    // ============================================
    // 4️⃣ CREAR TABLA SCHEDULES (solo si no existe) 🆕
    // ============================================
    if (!schedulesExists) {
      await db.query(`
        CREATE TABLE schedules (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          anime_id INT NOT NULL,
          day INT NOT NULL CHECK (day >= 0 AND day <= 6),
          hour INT NOT NULL CHECK (hour >= 0 AND hour <= 23),
          minute INT NOT NULL DEFAULT 0 CHECK (minute IN (0, 15, 30, 45)),
          notification_enabled BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
          FOREIGN KEY (anime_id) REFERENCES animes(id) ON DELETE CASCADE,
          UNIQUE KEY unique_schedule (user_id, anime_id, day, hour, minute),
          INDEX idx_user_id (user_id),
          INDEX idx_day_hour_minute (day, hour, minute),
          INDEX idx_notification (notification_enabled)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Tabla "schedules" creada (calendario de emisión con minutos)');
    } else {
      // Verificar si la tabla tiene la columna minute
      const [minuteColumn] = await db.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'schedules' 
          AND COLUMN_NAME = 'minute'
      `);

      if (minuteColumn.length === 0) {
        // Agregar columna minute
        await db.query(`
          ALTER TABLE schedules 
          ADD COLUMN minute INT NOT NULL DEFAULT 0 CHECK (minute IN (0, 15, 30, 45)) AFTER hour
        `);
        
        // Actualizar el índice y constraint
        await db.query(`ALTER TABLE schedules DROP INDEX unique_schedule`);
        await db.query(`
          ALTER TABLE schedules 
          ADD UNIQUE KEY unique_schedule (user_id, anime_id, day, hour, minute)
        `);
        
        await db.query(`ALTER TABLE schedules DROP INDEX idx_day_hour`);
        await db.query(`
          ALTER TABLE schedules 
          ADD INDEX idx_day_hour_minute (day, hour, minute)
        `);
        
        console.log('✅ Tabla "schedules" actualizada - soporte para minutos agregado');
      } else {
        console.log('✅ Tabla "schedules" ya existe con soporte de minutos - datos preservados');
      }
    }

    // ============================================
    // 5️⃣ VERIFICAR CANTIDAD DE DATOS
    // ============================================
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM usuarios');
    const [animeCount] = await db.query('SELECT COUNT(*) as count FROM animes');
    const [scheduleCount] = await db.query('SELECT COUNT(*) as count FROM schedules');
    
    console.log(`📊 Usuarios en DB: ${userCount[0].count}`);
    console.log(`📊 Animes en DB: ${animeCount[0].count}`);
    console.log(`📊 Horarios en DB: ${scheduleCount[0].count}`);
    console.log('🎉 Base de datos lista!');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    throw error;
  }
}

module.exports = initDatabase;