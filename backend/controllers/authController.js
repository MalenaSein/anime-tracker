const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// ============================================
// REGISTRO DE USUARIO
// ============================================
exports.register = async (req, res) => {
  try {
    // 1. Obtenemos los datos que envió el frontend
    const { username, email, password } = req.body;

    console.log('📝 Intento de registro:', { username, email });

    // 2. Verificamos si el usuario ya existe
    const [existingUser] = await db.query(
      'SELECT * FROM usuarios WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      console.log('⚠️ Usuario ya existe');
      return res.status(400).json({ error: 'Usuario o email ya existe' });
    }

    // 3. Encriptamos la contraseña (NUNCA guardar contraseñas en texto plano)
    // bcrypt genera un "hash" que es imposible de revertir
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insertamos el nuevo usuario en la base de datos
    const [result] = await db.query(
      'INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    console.log('✅ Usuario registrado con ID:', result.insertId);

    // 5. Creamos un token JWT (JSON Web Token)
    // Es como una "llave temporal" que identifica al usuario
    // Contiene: id del usuario, username, y expira en 7 días
    const token = jwt.sign(
      { id: result.insertId, username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Devolvemos la respuesta al frontend
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: { id: result.insertId, username, email }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// LOGIN DE USUARIO
// ============================================
exports.login = async (req, res) => {
  try {
    // 1. Obtenemos email y password del frontend
    const { email, password } = req.body;

    console.log('🔐 Intento de login:', email);

    // 2. Buscamos el usuario en la base de datos
    const [users] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    // 3. Si no existe, error
    if (users.length === 0) {
      console.log('⚠️ Usuario no encontrado');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];

    // 4. Verificamos la contraseña
    // bcrypt.compare compara la contraseña ingresada con el hash guardado
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log('⚠️ Contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    console.log('✅ Login exitoso para:', user.username);

    // 5. Creamos el token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Devolvemos el token y datos del usuario
    res.json({
      message: 'Login exitoso',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: error.message });
  }
};