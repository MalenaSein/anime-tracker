// ============================================
// config/firebase.js
// Inicialización de Firebase Admin SDK para el backend
// ============================================

const admin = require('firebase-admin');

// En producción (Render): las variables de entorno reemplazan el JSON
// En desarrollo: usás el archivo JSON descargado de Firebase Console

if (!admin.apps.length) {
  if (process.env.FIREBASE_PROJECT_ID) {
    // ✅ Producción: usar variables de entorno (más seguro)
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Las \n en la private key deben ser saltos de línea reales
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
    console.log('✅ Firebase Admin inicializado con variables de entorno');
  } else {
    // 🔧 Desarrollo: usar archivo JSON
    const serviceAccount = require('../../firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin inicializado con archivo JSON');
  }
}

module.exports = admin;