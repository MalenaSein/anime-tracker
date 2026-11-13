const mysql = require('mysql2');
require('dotenv').config();

// Aiven SIEMPRE requiere SSL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    // Aiven usa certificados válidos. Si tu proveedor usa un certificado
    // auto-firmado, podés desactivar la validación con DB_SSL_REJECT_UNAUTHORIZED=false.
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  }
});

const promisePool = pool.promise();

// Probamos la conexión
promisePool.query('SELECT 1')
  .then(() => {
    console.log('✅ Conectado a MySQL exitosamente');
  })
  .catch((err) => {
    console.error('❌ Error conectando a MySQL:', err.message);
    console.error('💡 Verifica tus variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
  });

module.exports = promisePool;