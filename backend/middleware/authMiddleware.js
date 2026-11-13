// ============================================
// authMiddleware con modo DUAL
// Acepta el JWT propio (usuarios viejos) Y Firebase ID Token (usuarios nuevos)
// ============================================

const jwt = require('jsonwebtoken');
const admin = require('../config/firebase');
const db = require('../config/database');

async function buildUniqueUsername(displayName, email) {
  const base = (displayName || (email || '').split('@')[0] || 'usuario')
    .replace(/\s+/g, '')
    .slice(0, 40) || 'usuario';

  const [existing] = await db.query('SELECT id FROM usuarios WHERE username = ?', [base]);
  if (existing.length === 0) return base;

  for (let i = 2; i <= 100; i += 1) {
    const suffix = `_${i}`;
    const candidate = `${base.slice(0, 50 - suffix.length)}${suffix}`;
    const [rows] = await db.query('SELECT id FROM usuarios WHERE username = ?', [candidate]);
    if (rows.length === 0) return candidate;
  }

  return `${base.slice(0, 30)}_${Date.now().toString(36)}`;
}

async function createFirebaseUser(decodedFirebase) {
  const email = decodedFirebase.email;
  const username = await buildUniqueUsername(decodedFirebase.name, email);

  try {
    const [result] = await db.query(
      'INSERT INTO usuarios (username, email, password, firebase_uid) VALUES (?, ?, ?, ?)',
      [username, email, 'FIREBASE_AUTH', decodedFirebase.uid]
    );

    return {
      id: result.insertId,
      username,
      email,
      firebase_uid: decodedFirebase.uid
    };
  } catch (error) {
    // Race condition: otro request creó el usuario mientras tanto
    if (error.code === 'ER_DUP_ENTRY') {
      const [rows] = await db.query(
        'SELECT id, username, email, firebase_uid FROM usuarios WHERE firebase_uid = ? OR email = ? LIMIT 1',
        [decodedFirebase.uid, email]
      );
      if (rows.length > 0) return rows[0];

      // Colisión de username: reintentar una vez con un sufijo único
      const retryUsername = `${username.slice(0, 30)}_${Date.now().toString(36)}`;
      const [retryResult] = await db.query(
        'INSERT INTO usuarios (username, email, password, firebase_uid) VALUES (?, ?, ?, ?)',
        [retryUsername, email, 'FIREBASE_AUTH', decodedFirebase.uid]
      );

      return {
        id: retryResult.insertId,
        username: retryUsername,
        email,
        firebase_uid: decodedFirebase.uid
      };
    }
    throw error;
  }
}

// Solo vinculamos un usuario legacy por email si Firebase confirma
// que el email está verificado (o si el proveedor es Google, que lo garantiza).
function canLinkByEmail(decodedFirebase) {
  return decodedFirebase.email_verified === true ||
    decodedFirebase.firebase?.sign_in_provider === 'google.com';
}

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
    if (admin.apps.length) {
      try {
        const decodedFirebase = await admin.auth().verifyIdToken(token);
        const firebaseUid = decodedFirebase.uid;
        const email = decodedFirebase.email;

        if (!email) {
          return res.status(401).json({ error: 'El token de Firebase no incluye un email' });
        }

        const [users] = await db.query(
          'SELECT id, username, email, firebase_uid FROM usuarios WHERE firebase_uid = ?',
          [firebaseUid]
        );

        let user = users[0];

        if (!user) {
          // No encontrado por firebase_uid — buscar por email antes de crear uno nuevo.
          const [usersByEmail] = await db.query(
            'SELECT id, username, email, firebase_uid FROM usuarios WHERE email = ?',
            [email]
          );

          if (usersByEmail.length > 0) {
            const existing = usersByEmail[0];

            if (existing.firebase_uid && existing.firebase_uid !== firebaseUid) {
              return res.status(409).json({
                error: 'Ese email ya está vinculado a otra cuenta',
                code: 'ACCOUNT_CONFLICT'
              });
            }

            if (!existing.firebase_uid) {
              if (!canLinkByEmail(decodedFirebase)) {
                return res.status(403).json({
                  error: 'Verificá tu email antes de iniciar sesión con esta cuenta',
                  code: 'EMAIL_NOT_VERIFIED'
                });
              }

              await db.query(
                'UPDATE usuarios SET firebase_uid = ? WHERE id = ?',
                [firebaseUid, existing.id]
              );
              existing.firebase_uid = firebaseUid;
              console.log('Linked firebase_uid to existing user:', email);
            }

            user = existing;
          } else {
            user = await createFirebaseUser(decodedFirebase);
            console.log('New Firebase user registered in MySQL:', email);
          }
        }

        req.user = {
          id: user.id,
          username: user.username || decodedFirebase.name,
          email: user.email,
          firebase_uid: firebaseUid,
          authMethod: 'firebase'
        };

        console.log('Auth Firebase OK:', req.user.username);
        return next();

      } catch (firebaseError) {
        // Solo cortamos acá si el token era de Firebase y expiró/fue revocado.
        // Cualquier otro error (p. ej. token JWT legacy) cae al fallback de abajo.
        if (
          firebaseError.code === 'auth/id-token-expired' ||
          firebaseError.code === 'auth/id-token-revoked'
        ) {
          return res.status(401).json({
            error: 'Sesión expirada, por favor inicia sesión nuevamente',
            code: 'TOKEN_EXPIRED'
          });
        }
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
          error: 'Sesión expirada, por favor inicia sesión nuevamente',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({ error: 'Token inválido' });
    }

  } catch (error) {
    console.error('Error en authMiddleware:', error.message);
    return res.status(401).json({ error: 'Error de autenticación' });
  }
};

module.exports = authMiddleware;