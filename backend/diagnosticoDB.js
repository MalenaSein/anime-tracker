// backend/diagnosticoDB.js
// SCRIPT PARA DIAGNOSTICAR PROBLEMAS EN LA BASE DE DATOS

const db = require('./config/database');

async function diagnosticar() {
  try {
    console.log('🔍 INICIANDO DIAGNÓSTICO DE BASE DE DATOS');
    console.log('==========================================\n');

    // 1. Verificar conexión
    console.log('1️⃣ Verificando conexión...');
    await db.query('SELECT 1');
    console.log('✅ Conexión exitosa\n');

    // 2. Listar todas las tablas
    console.log('2️⃣ Tablas en la base de datos:');
    const [tables] = await db.query(`
      SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME, UPDATE_TIME
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `);
    console.table(tables);
    console.log('');

    // 3. Verificar estructura de tabla usuarios
    console.log('3️⃣ Estructura de tabla USUARIOS:');
    const [usuariosColumns] = await db.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'usuarios'
      ORDER BY ORDINAL_POSITION
    `);
    console.table(usuariosColumns);
    console.log('');

    // 4. Verificar estructura de tabla animes
    console.log('4️⃣ Estructura de tabla ANIMES:');
    const [animesColumns] = await db.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'animes'
      ORDER BY ORDINAL_POSITION
    `);
    console.table(animesColumns);
    console.log('');

    // 5. Contar registros
    console.log('5️⃣ Conteo de registros:');
    const [userCount] = await db.query('SELECT COUNT(*) as total FROM usuarios');
    const [animeCount] = await db.query('SELECT COUNT(*) as total FROM animes');
    console.log(`   Usuarios: ${userCount[0].total}`);
    console.log(`   Animes: ${animeCount[0].total}`);
    console.log('');

    // 6. Mostrar últimos animes (si existen)
    if (animeCount[0].total > 0) {
      console.log('6️⃣ Últimos 5 animes en la base de datos:');
      const [recentAnimes] = await db.query(`
        SELECT id, user_id, nombre, estado, capitulos_vistos, created_at 
        FROM animes 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      console.table(recentAnimes);
    } else {
      console.log('6️⃣ No hay animes en la base de datos');
    }
    console.log('');

    // 7. Verificar índices
    console.log('7️⃣ Índices en tabla ANIMES:');
    const [indexes] = await db.query(`
      SHOW INDEX FROM animes
    `);
    console.table(indexes.map(idx => ({
      Key_name: idx.Key_name,
      Column_name: idx.Column_name,
      Non_unique: idx.Non_unique
    })));
    console.log('');

    console.log('✅ DIAGNÓSTICO COMPLETO');
    console.log('==========================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante diagnóstico:', error);
    process.exit(1);
  }
}

diagnosticar();