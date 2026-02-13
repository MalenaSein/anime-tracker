const nodemailer = require('nodemailer');

// ============================================
// CONFIGURACIÓN DEL TRANSPORTER DE EMAIL
// ============================================

// Verificar que las variables de entorno existen
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('❌ ERROR CRÍTICO: Faltan variables de entorno para email');
  console.error('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ Configurado' : '❌ NO configurado');
  console.error('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Configurado' : '❌ NO configurado');
  console.error('   SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com (default)');
  console.error('   SMTP_PORT:', process.env.SMTP_PORT || '587 (default)');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: true, // true para puerto 465, false para otros
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  // Agregar opciones de debug
  debug: true, // Mostrar logs detallados
  logger: true // Activar logger
});

// Verificar conexión al iniciar
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Error en configuración de email:', error.message);
    console.error('   Detalles completos:', error);
    
    // Diagnosticar el tipo de error
    if (error.code === 'EAUTH') {
      console.error('   💡 SOLUCIÓN: Verifica tu EMAIL_USER y EMAIL_PASSWORD');
      console.error('   💡 Si usas Gmail, necesitas una "App Password"');
      console.error('   💡 https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ECONNECTION') {
      console.error('   💡 SOLUCIÓN: Problema de conexión. Verifica SMTP_HOST y SMTP_PORT');
    } else if (error.code === 'ESOCKET') {
      console.error('   💡 SOLUCIÓN: Puerto bloqueado. Prueba con puerto 465 (secure: true)');
    }
  } else {
    console.log('✅ Servidor de email listo para enviar notificaciones');
    console.log(`   Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
    console.log(`   Port: ${process.env.SMTP_PORT || '587'}`);
    console.log(`   User: ${process.env.EMAIL_USER}`);
  }
});

// ============================================
// ENVIAR NOTIFICACIÓN DE NUEVO EPISODIO
// ============================================
const sendEpisodeNotification = async (userEmail, animeName, episodeTime) => {
  console.log(`📧 Intentando enviar email a: ${userEmail}`);
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Anime Tracker" <noreply@animetracker.com>',
    to: userEmail,
    subject: `Recordatorio: ${animeName} - ${episodeTime}`,
    text: `
Recordatorio de Anime Tracker

Tu anime "${animeName}" se emitirá en 1 minuto.

Horario programado: ${episodeTime}

Este es un recordatorio automático configurado en tu calendario.
Para gestionar tus notificaciones, accede a tu cuenta de Anime Tracker.
    `.trim(),
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 30px 20px; background-color: #667eea; color: #ffffff; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: normal;">Recordatorio de Anime</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 20px;">
                    <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px;">
                      Tu anime <strong>${animeName}</strong> se emitirá en aproximadamente 1 minuto.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                      <tr>
                        <td style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #667eea;">
                          <p style="margin: 0; color: #666666; font-size: 14px;">
                            <strong>Horario programado:</strong><br>${episodeTime}
                          </p>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                      Este es un recordatorio automático configurado en tu calendario de Anime Tracker.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      Para gestionar tus notificaciones, accede a tu cuenta de Anime Tracker
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    headers: {
      'X-Priority': '1',
      'Importance': 'high',
      'X-MSMail-Priority': 'High'
    }
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de episodio enviado a ${userEmail} para ${animeName}`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email de episodio:`, error.message);
    console.error(`   Para: ${userEmail}`);
    console.error(`   Anime: ${animeName}`);
    console.error(`   Error completo:`, error);
    
    // Diagnosticar error específico
    if (error.code === 'EAUTH') {
      console.error('   💡 Error de autenticación. Verifica EMAIL_USER y EMAIL_PASSWORD');
    } else if (error.responseCode === 535) {
      console.error('   💡 Gmail bloqueó el login. Usa una App Password');
    }
    
    throw error;
  }
};

// ============================================
// ENVIAR EMAIL DE RECUPERACIÓN DE CONTRASEÑA
// ============================================
const sendPasswordResetEmail = async (userEmail, username, resetUrl) => {
  console.log(`📧 Intentando enviar email de recuperación a: ${userEmail}`);
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Anime Tracker" <noreply@animetracker.com>',
    to: userEmail,
    subject: 'Recuperar contraseña - Anime Tracker',
    text: `
Hola ${username},

Recibiste este email porque solicitaste restablecer tu contraseña en Anime Tracker.

Hacé clic en el siguiente enlace para crear una nueva contraseña:
${resetUrl}

Este enlace es válido por 1 hora. Si no solicitaste este cambio, ignorá este email.

— Anime Tracker
    `.trim(),
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 30px 20px; background-color: #9333ea; color: #ffffff; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: normal;">Recuperar Contraseña</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 20px;">
                    <p style="color: #333; font-size: 16px;">Hola <strong>${username}</strong>,</p>
                    <p style="color: #555; font-size: 15px; line-height: 1.6;">
                      Recibiste este email porque solicitaste restablecer tu contraseña en Anime Tracker.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${resetUrl}" 
                         style="background-color: #9333ea; color: white; padding: 14px 28px; 
                                border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
                        Restablecer Contraseña
                      </a>
                    </div>
                    <p style="color: #888; font-size: 13px; line-height: 1.5;">
                      Este enlace es válido por <strong>1 hora</strong>.<br>
                      Si no solicitaste este cambio, podés ignorar este email.
                    </p>
                    <p style="color: #aaa; font-size: 12px; word-break: break-all;">
                      O copiá este enlace: ${resetUrl}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #999; font-size: 12px;">Anime Tracker</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de recuperación enviado a ${userEmail}`);
    console.log(`   Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email de recuperación:`, error.message);
    console.error(`   Para: ${userEmail}`);
    console.error(`   Error completo:`, error);
    throw error;
  }
};

module.exports = { sendEpisodeNotification, sendPasswordResetEmail };