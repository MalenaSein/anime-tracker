// ============================================
// PASO 3: authMiddleware con modo DUAL
// Acepta el JWT propio (usuarios viejos) Y Firebase ID Token (usuarios nuevos)
// Esto garantiza que nadie pierde acceso durante la transición
// ============================================

const jwt = require('jsonwebtoken');
const admin = require('../config/firebase'); // ver firebase.js más abajo
const db = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Formato de token inválido' });
    }

    const token = parts[1];

    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // ============================================
    // INTENTAR PRIMERO: Firebase ID Token
    // Los tokens de Firebase empiezan diferente a los JWT propios
    // ============================================
    try {
      const decodedFirebase = await admin.auth().verifyIdToken(token);

      // Token Firebase válido — buscar el usuario en MySQL por firebase_uid
      const firebaseUid = decodedFirebase.uid;

      const [users] = await db.query(
        'SELECT id, username, email FROM usuarios WHERE firebase_uid = ?',
        [firebaseUid]
      );

      if (users.length > 0) {
        // Usuario migrado — tiene registro en MySQL
        req.user = {
          id: users[0].id,
          username: users[0].username || decodedFirebase.name,
          email: users[0].email,
          firebase_uid: firebaseUid,
          authMethod: 'firebase'
        };
      } else {
        // Usuario nuevo de Firebase (registrado después de la migración)
        // Crear registro en MySQL automáticamente
        const username = decodedFirebase.name || decodedFirebase.email.split('@')[0];
        const email = decodedFirebase.email;

        const [result] = await db.query(
          'INSERT INTO usuarios (username, email, password, firebase_uid) VALUES (?, ?, ?, ?)',
          [username, email, 'FIREBASE_AUTH', firebaseUid]
        );

        req.user = {
          id: result.insertId,
          username,
          email,
          firebase_uid: firebaseUid,
          authMethod: 'firebase'
        };

        console.log('👤 Nuevo usuario Firebase registrado en MySQL:', email);
      }

      console.log('✅ Auth Firebase:', req.user.username);
      return next();

    } catch (firebaseError) {
      // No es un token Firebase — probar con JWT propio
      // Esto cubre a los usuarios que todavía tienen el token viejo guardado
      if (
        firebaseError.code === 'auth/argument-error' ||
        firebaseError.code === 'auth/id-token-expired' ||
        firebaseError.errorInfo?.code === 'auth/argument-error'
      ) {
        // Era un token Firebase pero expiró — rechazar
        return res.status(401).json({
          error: 'Sesión expirada, por favor iniciá sesión nuevamente',
          code: 'TOKEN_EXPIRED'
        });
      }

      // No era Firebase — intentar como JWT propio
    }

    // ============================================
    // FALLBACK: JWT propio (usuarios con token viejo)
    // Se puede eliminar este bloque una vez que todos migren
    // ============================================
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.id,
        username: decoded.username,
        authMethod: 'jwt_legacy'
      };

      console.log('✅ Auth JWT legacy:', decoded.username);
      return next();

    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Sesión expirada, por favor iniciá sesión nuevamente',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({ error: 'Token inválido' });
    }

  } catch (error) {
    console.error('❌ Error en authMiddleware:', error.message);
    return res.status(401).json({ error: 'Error de autenticación' });
  }
};

module.exports = authMiddleware;