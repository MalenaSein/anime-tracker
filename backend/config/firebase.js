// ============================================
// config/firebase.js
// Inicialización de Firebase Admin SDK para el backend
// ============================================

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function loadServiceAccount() {
  const candidates = [
    path.join(__dirname, '..', 'firebase-service-account.json'),
    path.join(__dirname, '..', '..', 'firebase-service-account.json')
  ];

  for (const file of candidates) {
    if (fs.existsSync(file)) {
      return require(file);
    }
  }

  return null;
}

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID) {
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (!clientEmail || !privateKey) {
        throw new Error('Faltan FIREBASE_CLIENT_EMAIL o FIREBASE_PRIVATE_KEY');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n')
        })
      });
      console.log('✅ Firebase Admin inicializado con variables de entorno');
    } else {
      const serviceAccount = loadServiceAccount();

      if (!serviceAccount) {
        console.warn('⚠️ Firebase Admin no configurado. Se usará solo autenticación JWT legacy.');
      } else {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin inicializado con archivo JSON');
      }
    }
  } catch (error) {
    console.error('❌ No se pudo inicializar Firebase Admin:', error.message);
    console.error('   La autenticación Firebase quedará deshabilitada.');
  }
}

module.exports = admin;