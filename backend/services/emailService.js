const nodemailer = require('nodemailer');

// ============================================
// CONFIGURACIÓN DEL TRANSPORTER DE EMAIL
// ============================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true para puerto 465, false para otros
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verificar la configuración al iniciar
transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Error en configuración de email:', error);
  } else {
    console.log('✅ Servidor de email listo para enviar notificaciones');
  }
});

// ============================================
// ENVIAR NOTIFICACIÓN DE NUEVO EPISODIO
// ============================================
const sendEpisodeNotification = async (userEmail, animeName, episodeTime) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Anime Tracker" <noreply@animetracker.com>',
    to: userEmail,
    subject: `Recordatorio: ${animeName} - ${episodeTime}`,
    // ⚠️ IMPORTANTE: El texto plano es CLAVE para evitar spam/promociones
    // Gmail clasifica emails sin texto plano como promocionales
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
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                
                <!-- Header simple sin gradientes -->
                <tr>
                  <td style="padding: 30px 20px; background-color: #667eea; color: #ffffff; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: normal;">Recordatorio de Anime</h1>
                  </td>
                </tr>
                
                <!-- Contenido principal -->
                <tr>
                  <td style="padding: 30px 20px;">
                    <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px;">
                      Tu anime <strong>${animeName}</strong> se emitirá en aproximadamente 1 minuto.
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                      <tr>
                        <td style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #667eea;">
                          <p style="margin: 0; color: #666666; font-size: 14px;">
                            <strong>Horario programado:</strong><br>
                            ${episodeTime}
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 20px 0 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                      Este es un recordatorio automático configurado en tu calendario de Anime Tracker.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
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
    // Headers adicionales para indicar que es una notificación importante
    headers: {
      'X-Priority': '1',
      'Importance': 'high',
      'X-MSMail-Priority': 'High'
    }
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${userEmail} para ${animeName}`);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw error;
  }
};

module.exports = { sendEpisodeNotification };