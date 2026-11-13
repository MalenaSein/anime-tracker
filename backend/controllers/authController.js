const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const admin = require('../config/firebase');
const {
  isNonEmptyString,
  isValidEmail
} = require('../utils/validation');

const signToken = (user) => jwt.sign(
  { id: user.id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// ============================================
// REGISTRO DE USUARIO (legacy email + password)
// ============================================
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!isNonEmptyString(username) || username.trim().length < 3 || username.trim().length > 50) {
      return res.status(400).json({ error: 'El nombre de usuario debe tener entre 3 y 50 caracteres' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'El email no es válido' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const trimmedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const [existingUser] = await db.query(
      'SELECT id FROM usuarios WHERE email = ? OR username = ?',
      [normalizedEmail, trimmedUsername]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Usuario o email ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)',
      [trimmedUsername, normalizedEmail, hashedPassword]
    );

    const user = { id: result.insertId, username: trimmedUsername, email: normalizedEmail };

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token: signToken(user),
      user
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ============================================
// LOGIN DE USUARIO (legacy email + password)
// ============================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email) || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const [users] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email.trim().toLowerCase()]
    );
    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({
      message: 'Login exitoso',
      token: signToken(user),
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ============================================
// DATOS DEL USUARIO ACTUAL
// ============================================
exports.getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email FROM usuarios WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({
      ...users[0],
      authMethod: req.user.authMethod
    });
  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ============================================
// CAMBIAR NOMBRE DE USUARIO
// ============================================
exports.changeUsername = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newUsername } = req.body;

    if (!isNonEmptyString(newUsername) || newUsername.trim().length < 3 || newUsername.trim().length > 50) {
      return res.status(400).json({ error: 'El nombre de usuario debe tener entre 3 y 50 caracteres' });
    }

    const username = newUsername.trim();

    const [existing] = await db.query(
      'SELECT id FROM usuarios WHERE username = ? AND id != ?',
      [username, userId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ese nombre de usuario ya está en uso' });
    }

    await db.query('UPDATE usuarios SET username = ? WHERE id = ?', [username, userId]);

    // Mantener Firebase sincronizado para que el nombre persista al recargar.
    if (req.user.firebase_uid && admin.apps.length) {
      try {
        await admin.auth().updateUser(req.user.firebase_uid, { displayName: username });
      } catch (firebaseError) {
        console.error('⚠️ No se pudo actualizar displayName en Firebase:', firebaseError.message);
      }
    }

    const [updatedUser] = await db.query(
      'SELECT id, username, email FROM usuarios WHERE id = ?', [userId]
    );

    res.json({
      message: 'Nombre actualizado',
      token: signToken(updatedUser[0]),
      user: updatedUser[0]
    });
  } catch (error) {
    console.error('❌ Error cambiando username:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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

    const user = users[0];
    const isFirebaseOnly = Boolean(user.firebase_uid) && user.password === 'FIREBASE_AUTH';

    // Las cuentas creadas por Firebase no tienen contraseña local.
    // Las cuentas legacy (o vinculadas) sí la requieren por seguridad.
    if (!isFirebaseOnly) {
      if (typeof password !== 'string' || !password) {
        return res.status(400).json({ error: 'Debés ingresar tu contraseña' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    if (user.firebase_uid && admin.apps.length) {
      try {
        await admin.auth().deleteUser(user.firebase_uid);
      } catch (firebaseError) {
        if (firebaseError.code !== 'auth/user-not-found') {
          console.error('⚠️ No se pudo eliminar el usuario de Firebase:', firebaseError.message);
        }
      }
    }

    await db.query('DELETE FROM usuarios WHERE id = ?', [userId]);
    res.json({ message: 'Cuenta eliminada exitosamente' });
  } catch (error) {
    console.error('❌ Error eliminando cuenta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};