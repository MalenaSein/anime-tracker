const jwt = require('jsonwebtoken');

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================
// Un "middleware" es como un guardia de seguridad
// Se ejecuta ANTES de permitir el acceso a ciertas rutas

const authMiddleware = (req, res, next) => {
  try {
    // 1. Obtenemos el token del header Authorization
    // Formato: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    // 2. Extraemos solo el token (quitamos la palabra "Bearer ")
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // 3. Verificamos que el token sea válido
    // jwt.verify desencripta el token usando JWT_SECRET
    // Si el token expiró o fue modificado, lanza un error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Guardamos los datos del usuario en req.user
    // Ahora cualquier función que se ejecute después tendrá acceso a req.user
    req.user = decoded;  // { id: 1, username: 'otaku123' }

    console.log('✅ Usuario autenticado:', decoded.username);

    // 5. next() le dice a Express "ok, todo bien, continúa"
    next();

  } catch (error) {
    console.error('❌ Error de autenticación:', error.message);
    
    // Si el token expiró
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado, por favor inicia sesión nuevamente' });
    }
    
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = authMiddleware;