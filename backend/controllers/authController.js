const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const crypto = require('crypto');

// Helper: hashear PIN
const hashPin = (pin) => crypto.createHash('sha256').update(pin).digest('hex');

// ============================================
// REGISTRO DE USUARIO
// ============================================
exports.register = async (req, res) => {
  try {
    const { username, email, password, recovery_pin } = req.body;
    console.log('📝 Intento de registro:', { username, email });

    // Validar PIN
    if (!recovery_pin || !/^\d{4}$/.test(recovery_pin)) {
      return res.status(400).json({ error: 'El PIN de recuperación debe ser 4 dígitos numéricos' });
    }

    const [existingUser] = await db.query(
      'SELECT * FROM usuarios WHERE email = ? OR username = ?',
      [email, username]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Usuario o email ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPin = hashPin(recovery_pin);

    const [result] = await db.query(
      'INSERT INTO usuarios (username, email, password, recovery_pin) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, hashedPin]
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

    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
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
// CAMBIAR NOMBRE DE USUARIO
// ============================================
exports.changeUsername = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newUsername } = req.body;

    if (!newUsername || newUsername.trim().length < 3) {
      return res.status(400).json({ error: 'El nombre de usuario debe tener al menos 3 caracteres' });
    }

    const [existing] = await db.query(
      'SELECT id FROM usuarios WHERE username = ? AND id != ?',
      [newUsername.trim(), userId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ese nombre de usuario ya está en uso' });
    }

    await db.query('UPDATE usuarios SET username = ? WHERE id = ?', [newUsername.trim(), userId]);

    const [updatedUser] = await db.query(
      'SELECT id, username, email FROM usuarios WHERE id = ?', [userId]
    );

    const newToken = jwt.sign(
      { id: updatedUser[0].id, username: updatedUser[0].username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Nombre actualizado', token: newToken, user: updatedUser[0] });
  } catch (error) {
    console.error('❌ Error cambiando username:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// ELIMINAR CUENTA
// ============================================
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    const [users] = await db.query('SELECT * FROM usuarios WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    const isValidPassword = await bcrypt.compare(password, users[0].password);
    if (!isValidPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

    await db.query('DELETE FROM usuarios WHERE id = ?', [userId]);
    res.json({ message: 'Cuenta eliminada exitosamente' });
  } catch (error) {
    console.error('❌ Error eliminando cuenta:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// VERIFICAR SI EMAIL EXISTE Y TIENE PIN
// POST /api/auth/check-recovery
// ============================================
exports.checkRecovery = async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await db.query(
      'SELECT id, recovery_pin FROM usuarios WHERE email = ?', [email]
    );

    if (users.length === 0) {
      // No revelamos si existe o no por seguridad, pero en este caso
      // el flujo necesita saberlo para mostrar el mensaje correcto
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      hasPin: !!users[0].recovery_pin
    });
  } catch (error) {
    console.error('❌ Error en check-recovery:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// CAMBIAR CONTRASEÑA CON PIN
// POST /api/auth/reset-password-pin
// ============================================
exports.resetPasswordWithPin = async (req, res) => {
  try {
    const { email, pin, newPassword } = req.body;

    if (!pin || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN inválido' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const hashedPin = hashPin(pin);

    const [users] = await db.query(
      'SELECT id FROM usuarios WHERE email = ? AND recovery_pin = ?',
      [email, hashedPin]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'PIN incorrecto' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, users[0].id]);

    console.log('✅ Contraseña reseteada con PIN para:', email);
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('❌ Error reseteando contraseña con PIN:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// CREAR PIN PARA USUARIO SIN PIN (una sola vez)
// POST /api/auth/setup-pin
// Requiere: email + username exacto + nuevo PIN
// ============================================
exports.setupPin = async (req, res) => {
  try {
    const { email, username, pin } = req.body;

    if (!pin || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'El PIN debe ser 4 dígitos numéricos' });
    }

    // Verificar que email + username coincidan Y que no tenga PIN
    const [users] = await db.query(
      'SELECT id, recovery_pin FROM usuarios WHERE email = ? AND username = ?',
      [email, username]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'Email o nombre de usuario incorrectos' });
    }

    if (users[0].recovery_pin) {
      return res.status(400).json({ error: 'Esta cuenta ya tiene un PIN configurado' });
    }

    const hashedPin = hashPin(pin);
    await db.query('UPDATE usuarios SET recovery_pin = ? WHERE id = ?', [hashedPin, users[0].id]);

    console.log('✅ PIN configurado para usuario ID:', users[0].id);
    res.json({ message: 'PIN configurado exitosamente' });
  } catch (error) {
    console.error('❌ Error configurando PIN:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// CAMBIAR PIN (desde perfil, autenticado)
// PUT /api/auth/change-pin
// ============================================
exports.changePin = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPin, newPin } = req.body;

    if (!newPin || !/^\d{4}$/.test(newPin)) {
      return res.status(400).json({ error: 'El nuevo PIN debe ser 4 dígitos' });
    }

    const [users] = await db.query('SELECT recovery_pin FROM usuarios WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Si ya tiene PIN, verificar el actual
    if (users[0].recovery_pin) {
      if (!currentPin) return res.status(400).json({ error: 'Debés ingresar tu PIN actual' });
      const hashedCurrent = hashPin(currentPin);
      if (hashedCurrent !== users[0].recovery_pin) {
        return res.status(400).json({ error: 'PIN actual incorrecto' });
      }
    }

    const hashedNewPin = hashPin(newPin);
    await db.query('UPDATE usuarios SET recovery_pin = ? WHERE id = ?', [hashedNewPin, userId]);

    res.json({ message: 'PIN actualizado exitosamente' });
  } catch (error) {
    console.error('❌ Error cambiando PIN:', error);
    res.status(500).json({ error: error.message });
  }
};