const db = require('./config/database');

async function initDatabase() {
  try {
    console.log('🔧 Inicializando base de datos...');

    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME IN ('usuarios', 'animes', 'schedules', 'push_subscriptions')
    `);

    const existingTables = tables.map(t => t.TABLE_NAME);
    const usuariosExists = existingTables.includes('usuarios');
    const animesExists = existingTables.includes('animes');
    const schedulesExists = existingTables.includes('schedules');
    const pushSubscriptionsExists = existingTables.includes('push_subscriptions');

    // ============================================
    // TABLA USUARIOS
    // ============================================
    if (!usuariosExists) {
      await db.query(`
        CREATE TABLE usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          email VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          reset_token VARCHAR(255),
          reset_token_expiry DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_username (username),
          INDEX idx_reset_token (reset_token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Tabla "usuarios" creada');
    } else {
      // Agregar columnas de reset si no existen
      const [cols] = await db.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios'
        AND COLUMN_NAME IN ('reset_token', 'reset_token_expiry')
      `);
      const colNames = cols.map(c => c.COLUMN_NAME);

      if (!colNames.includes('reset_token')) {
        await db.query(`ALTER TABLE usuarios ADD COLUMN reset_token VARCHAR(255)`);
        await db.query(`ALTER TABLE usuarios ADD INDEX idx_reset_token (reset_token)`);
        console.log('✅ Columna reset_token agregada a usuarios');
      }
      if (!colNames.includes('reset_token_expiry')) {
        await db.query(`ALTER TABLE usuarios ADD COLUMN reset_token_expiry DATETIME`);
        console.log('✅ Columna reset_token_expiry agregada a usuarios');
      }

      console.log('✅ Tabla "usuarios" verificada');
    }

    // ============================================
    // TABLA ANIMES - con estado 'por_ver' ✨
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
          estado ENUM('viendo', 'completado', 'pausado', 'abandonado', 'por_ver') DEFAULT 'viendo',
          calificacion INT,
          generos VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_estado (estado)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Tabla "animes" creada con estado "por_ver"');
    } else {
      // Verificar si el ENUM ya tiene 'por_ver'
      const [enumInfo] = await db.query(`
        SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'animes' AND COLUMN_NAME = 'estado'
      `);

      if (enumInfo.length > 0 && !enumInfo[0].COLUMN_TYPE.includes('por_ver')) {
        await db.query(`
          ALTER TABLE animes MODIFY COLUMN estado 
          ENUM('viendo', 'completado', 'pausado', 'abandonado', 'por_ver') DEFAULT 'viendo'
        `);
        console.log('✅ Estado "por_ver" agregado al ENUM de animes');
      }

      // Verificar columna generos
      const [columns] = await db.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'animes' AND COLUMN_NAME = 'generos'
      `);
      if (columns.length === 0) {
        await db.query(`ALTER TABLE animes ADD COLUMN generos VARCHAR(255)`);
        console.log('✅ Columna "generos" agregada a animes');
      }

      console.log('✅ Tabla "animes" verificada');
    }

    // ============================================
    // TABLA SCHEDULES
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
      console.log('✅ Tabla "schedules" creada');
    } else {
      const [minuteColumn] = await db.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'schedules' AND COLUMN_NAME = 'minute'
      `);

      if (minuteColumn.length === 0) {
        await db.query(`ALTER TABLE schedules ADD COLUMN minute INT NOT NULL DEFAULT 0 AFTER hour`);
        await db.query(`ALTER TABLE schedules DROP INDEX unique_schedule`).catch(() => {});
        await db.query(`ALTER TABLE schedules ADD UNIQUE KEY unique_schedule (user_id, anime_id, day, hour, minute)`);
        console.log('✅ Columna "minute" agregada a schedules');
      }

      console.log('✅ Tabla "schedules" verificada');
    }

    // ============================================
    // TABLA PUSH_SUBSCRIPTIONS 🆕 NUEVO
    // ============================================
    if (!pushSubscriptionsExists) {
      await db.query(`
        CREATE TABLE push_subscriptions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          endpoint VARCHAR(500) NOT NULL UNIQUE,
          p256dh VARCHAR(255) NOT NULL,
          auth VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_endpoint (endpoint(255))
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Tabla "push_subscriptions" creada');
    } else {
      console.log('✅ Tabla "push_subscriptions" verificada');
    }

    // Stats
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM usuarios');
    const [animeCount] = await db.query('SELECT COUNT(*) as count FROM animes');
    const [scheduleCount] = await db.query('SELECT COUNT(*) as count FROM schedules');
    const [pushCount] = await db.query('SELECT COUNT(*) as count FROM push_subscriptions');
    
    console.log(`📊 Usuarios: ${userCount[0].count} | Animes: ${animeCount[0].count} | Horarios: ${scheduleCount[0].count} | Push: ${pushCount[0].count}`);
    console.log('🎉 Base de datos lista!');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    throw error;
  }
}

module.exports = initDatabase;