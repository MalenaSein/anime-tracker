// ============================================
// authMiddleware con modo DUAL
// Acepta el JWT propio (usuarios viejos) Y Firebase ID Token (usuarios nuevos)
// ============================================

const jwt = require('jsonwebtoken');
const admin = require('../config/firebase');
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
    // ============================================
    try {
      const decodedFirebase = await admin.auth().verifyIdToken(token);
      const firebaseUid = decodedFirebase.uid;
      const email = decodedFirebase.email;

      // Buscar usuario por firebase_uid
      const [users] = await db.query(
        'SELECT id, username, email, firebase_uid FROM usuarios WHERE firebase_uid = ?',
        [firebaseUid]
      );

      if (users.length > 0) {
        // Camino normal
        req.user = {
          id: users[0].id,
          username: users[0].username || decodedFirebase.name,
          email: users[0].email,
          firebase_uid: firebaseUid,
          authMethod: 'firebase'
        };

      } else {
        // No encontrado por firebase_uid — buscar por EMAIL antes de crear uno nuevo.
        // Esto cubre el caso donde el usuario existia antes de integrar Firebase
        // y su registro en MySQL no tiene firebase_uid guardado todavia.
        // Sin este fallback, se crea un usuario nuevo con un id distinto y
        // todas las queries devuelven listas vacias hasta que se cierra sesion.
        const [usersByEmail] = await db.query(
          'SELECT id, username, email, firebase_uid FROM usuarios WHERE email = ?',
          [email]
        );

        if (usersByEmail.length > 0) {
          // Usuario existente encontrado por email — vincular firebase_uid para la proxima vez
          if (!usersByEmail[0].firebase_uid) {
            await db.query(
              'UPDATE usuarios SET firebase_uid = ? WHERE id = ?',
              [firebaseUid, usersByEmail[0].id]
            );
            console.log('Linked firebase_uid to existing user:', email);
          }

          req.user = {
            id: usersByEmail[0].id,
            username: usersByEmail[0].username,
            email: usersByEmail[0].email,
            firebase_uid: firebaseUid,
            authMethod: 'firebase'
          };

        } else {
          // Usuario realmente nuevo
          const username = decodedFirebase.name || email.split('@')[0];

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

          console.log('New Firebase user registered in MySQL:', email);
        }
      }

      console.log('Auth Firebase OK:', req.user.username);
      return next();

    } catch (firebaseError) {
      if (
        firebaseError.code === 'auth/argument-error' ||
        firebaseError.code === 'auth/id-token-expired' ||
        firebaseError.errorInfo?.code === 'auth/argument-error'
      ) {
        return res.status(401).json({
          error: 'Sesion expirada, por favor inicia sesion nuevamente',
          code: 'TOKEN_EXPIRED'
        });
      }
    }

    // ============================================
    // FALLBACK: JWT propio (usuarios con token viejo)
    // ============================================
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.id,
        username: decoded.username,
        authMethod: 'jwt_legacy'
      };

      console.log('Auth JWT legacy OK:', decoded.username);
      return next();

    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Sesion expirada, por favor inicia sesion nuevamente',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({ error: 'Token invalido' });
    }

  } catch (error) {
    console.error('Error en authMiddleware:', error.message);
    return res.status(401).json({ error: 'Error de autenticacion' });
  }
};

module.exports = authMiddleware;