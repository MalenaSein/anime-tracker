const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { sendPasswordResetEmail } = require('../services/pushNotificationService');
const crypto = require('crypto');

// ============================================
// REGISTRO DE USUARIO
// ============================================
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('🔐 Intento de registro:', { username, email });

    const [existingUser] = await db.query(
      'SELECT * FROM usuarios WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Usuario o email ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const token = jwt.sign(
      { id: result.insertId, username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

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
    const { email, password } = req.body;
    console.log('🔐 Intento de login:', email);

    const [users] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

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

// ============================================
// CAMBIAR NOMBRE DE USUARIO ✨ NUEVO
// ============================================
exports.changeUsername = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newUsername } = req.body;

    if (!newUsername || newUsername.trim().length < 3) {
      return res.status(400).json({ error: 'El nombre de usuario debe tener al menos 3 caracteres' });
    }

    // Verificar que no esté en uso por otro usuario
    const [existing] = await db.query(
      'SELECT id FROM usuarios WHERE username = ? AND id != ?',
      [newUsername.trim(), userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ese nombre de usuario ya está en uso' });
    }

    await db.query(
      'UPDATE usuarios SET username = ? WHERE id = ?',
      [newUsername.trim(), userId]
    );

    // Generar nuevo token con el username actualizado
    const [updatedUser] = await db.query(
      'SELECT id, username, email FROM usuarios WHERE id = ?',
      [userId]
    );

    const newToken = jwt.sign(
      { id: updatedUser[0].id, username: updatedUser[0].username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Username actualizado para usuario ID:', userId);
    res.json({
      message: 'Nombre de usuario actualizado exitosamente',
      token: newToken,
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('❌ Error cambiando username:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// ELIMINAR CUENTA ✨ NUEVO
// ============================================
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    // Verificar contraseña antes de eliminar
    const [users] = await db.query(
      'SELECT * FROM usuarios WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isValidPassword = await bcrypt.compare(password, users[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Eliminar usuario (los animes se eliminan en cascada por el FK)
    await db.query('DELETE FROM usuarios WHERE id = ?', [userId]);

    console.log('✅ Cuenta eliminada para usuario ID:', userId);
    res.json({ message: 'Cuenta eliminada exitosamente' });

  } catch (error) {
    console.error('❌ Error eliminando cuenta:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// SOLICITAR RECUPERACIÓN DE CONTRASEÑA ✨ NUEVO
// ============================================
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    // Siempre responder igual por seguridad
    if (users.length === 0) {
      return res.json({ 
        message: 'Si el email existe, se generó un código',
        codeGenerated: false 
      });
    }

    const user = users[0];

    // Generar código de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Hashear el código antes de guardarlo
    const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    await db.query(
      'UPDATE usuarios SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [hashedCode, resetTokenExpiry, user.id]
    );

    console.log(`📋 Código de recuperación para ${email}: ${resetCode}`);
    console.log(`   Username: ${user.username}`);

    // ✅ DEVOLVER EL CÓDIGO AL FRONTEND
    res.json({ 
      message: 'Código de recuperación generado',
      codeGenerated: true,
      resetCode: resetCode,  // ← El frontend lo mostrará
      username: user.username,
      expiresIn: '1 hora'
    });

  } catch (error) {
    console.error('❌ Error en solicitud de reset:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// RESETEAR CONTRASEÑA CON CÓDIGO ✨ NUEVO
// ============================================
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    if (!code || code.length !== 6) {
      return res.status(400).json({ 
        error: 'El código debe tener 6 dígitos' 
      });
    }

    // Hashear el código ingresado
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    // Buscar usuario con código válido
    const [users] = await db.query(
      'SELECT * FROM usuarios WHERE email = ? AND reset_token = ? AND reset_token_expiry > NOW()',
      [email, hashedCode]
    );

    if (users.length === 0) {
      return res.status(400).json({ 
        error: 'Código inválido o expirado' 
      });
    }

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE usuarios SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, users[0].id]
    );

    console.log('✅ Contraseña reseteada para:', email);
    res.json({ message: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    console.error('❌ Error reseteando contraseña:', error);
    res.status(500).json({ error: error.message });
  }
};