const jwt = require('jsonwebtoken');

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================
// Un "middleware" es como un guardia de seguridad
// Se ejecuta ANTES de permitir el acceso a ciertas rutas

const authMiddleware = (req, res, next) => {
  try {
    // 1. Obtenemos el token del header Authorization
    const authHeader = req.headers.authorization;
    
    // 🔍 DEBUG: Ver qué está llegando
    console.log('🔍 Authorization header:', authHeader ? authHeader.substring(0, 30) + '...' : 'NO ENVIADO');
    
    if (!authHeader) {
      console.log('❌ No hay header de autorización');
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    // 2. Extraemos solo el token (quitamos la palabra "Bearer ")
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      console.log('❌ Formato incorrecto. Tiene', parts.length, 'partes');
      return res.status(401).json({ error: 'Formato de token inválido' });
    }
    
    const token = parts[1];

    if (!token || token === 'null' || token === 'undefined') {
      console.log('❌ Token vacío o null');
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    // 🔍 DEBUG: Ver inicio del token
    console.log('🔑 Token (primeros 30 chars):', token.substring(0, 30) + '...');

    // 3. Verificamos que el token sea válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Guardamos los datos del usuario en req.user
    req.user = decoded;

    console.log('✅ Usuario autenticado:', decoded.username);

    // 5. next() le dice a Express "ok, todo bien, continúa"
    next();

  } catch (error) {
    console.error('❌ Error de autenticación:', error.message);
    console.error('   Tipo de error:', error.name);
    
    // Si el token expiró
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado, por favor inicia sesión nuevamente',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    // Si el token está malformado
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token corrupto. Cierra sesión e inicia sesión nuevamente',
        code: 'TOKEN_MALFORMED'
      });
    }
    
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = authMiddleware;