// registro.js
// Flujo completo: registrar usuario + email de bienvenida con Resend (gratuito)
// Instalación: npm install express resend dotenv

//require("dotenv").config();
import 'dotenv/config'; 
import express from "express";
import { Resend } from "resend";

const app = express();
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Base de datos simulada (en producción usarías MongoDB, PostgreSQL, etc.) ──
const usuarios = [];

// ─── Plantilla HTML del email de bienvenida ────────────────────────────────
function emailDeBienvenida({ nombre, email }) {
  return `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:40px 20px;">
              <table width="560" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;
                            box-shadow:0 4px 12px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                  <td style="background:#4f46e5;padding:36px 30px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:26px;">🎉 ¡Bienvenido!</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px 30px;">
                    <p style="margin:0 0 16px;color:#333;font-size:16px;">
                      Hola <strong>${nombre}</strong>,
                    </p>
                    <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">
                      Tu cuenta fue creada exitosamente con el email <strong>${email}</strong>.
                      Ya puedes acceder a todos los recursos de la plataforma.
                    </p>

                    <!-- Botón CTA -->
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#4f46e5;border-radius:6px;">
                          <a href="https://tuapp.com/login"
                            style="display:inline-block;padding:13px 28px;color:#fff;
                                    font-size:15px;font-weight:700;text-decoration:none;">
                            Ir a mi cuenta →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:20px 30px;border-top:1px solid #eee;text-align:center;">
                    <p style="margin:0;color:#aaa;font-size:12px;">
                      Si no creaste esta cuenta, ignora este mensaje.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
  `.trim();
}

// ─── Ruta de registro ──────────────────────────────────────────────────────
app.post("/registro", async (req, res) => {
  const { nombre, email, password } = req.body;

  // 1. Validación básica
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  if (usuarios.find((u) => u.email === email)) {
    return res.status(409).json({ error: "El email ya está registrado" });
  }

  // 2. Guardar usuario (en producción: hashear password con bcrypt)
  const nuevoUsuario = { id: Date.now(), nombre, email };
  usuarios.push(nuevoUsuario);
  console.log("✅ Usuario registrado:", nuevoUsuario);

  // 3. Enviar email de bienvenida con Resend
  try {
    const { data, error } = await resend.emails.send({
      from: "Mi App <onboarding@resend.dev>", // en pruebas usa este dominio de Resend
      to: email,
      subject: `¡Bienvenido a Mi App, ${nombre}! 🎉`,
      html: emailDeBienvenida({ nombre, email }),
    });

    if (error) {
      console.error("⚠️  Email no enviado:", error);
      // El usuario se registró igual; el email es secundario
    } else {
      console.log("📧 Email enviado. ID:", data.id);
    }
  } catch (err) {
    console.error("⚠️  Error al enviar email:", err.message);
  }

  // 4. Responder al cliente
  return res.status(201).json({
    mensaje: "Usuario registrado. Revisa tu email.",
    usuario: nuevoUsuario,
  });
});

// ─── Iniciar servidor ──────────────────────────────────────────────────────
app.listen(3000, () => {
  console.log("🚀 Servidor corriendo en http://localhost:3000");
  console.log('   Prueba con: POST /registro  {"nombre","email","password"}');
});