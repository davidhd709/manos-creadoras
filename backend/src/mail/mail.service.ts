import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('MAIL_HOST', 'smtp.gmail.com'),
      port: this.config.get<number>('MAIL_PORT', 587),
      secure: false,
      auth: {
        user: this.config.get('MAIL_USER'),
        pass: this.config.get('MAIL_PASS'),
      },
    });
  }

  async sendArtisanWelcome(email: string, name: string, password: string): Promise<void> {
    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:5173');
    try {
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM', 'noreply@manoscreadoras.com'),
        to: email,
        subject: 'Bienvenido a Manos Creadoras - Tus credenciales de acceso',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #e8833a;">
              <h1 style="color: #e8833a; margin: 0;">Manos<span style="color: #333;">Creadoras</span></h1>
            </div>
            <div style="padding: 30px 0;">
              <h2 style="color: #333;">Hola ${name},</h2>
              <p style="color: #555; line-height: 1.6;">
                Tu cuenta de artesano ha sido creada exitosamente en <strong>Manos Creadoras</strong>.
                A continuacion encontraras tus credenciales de acceso:
              </p>
              <div style="background: #f8f8f8; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #e8833a;">
                <p style="margin: 0 0 10px 0;"><strong>Correo:</strong> ${email}</p>
                <p style="margin: 0;"><strong>Contrasena provisional:</strong> ${password}</p>
              </div>
              <p style="color: #d32f2f; font-weight: bold;">
                Por seguridad, al ingresar por primera vez deberas cambiar tu contrasena.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${frontendUrl}/login" style="background: #e8833a; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  Ingresar al sistema
                </a>
              </div>
            </div>
            <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #999; font-size: 12px;">
              <p>Este correo fue enviado automaticamente. No respondas a este mensaje.</p>
              <p>Manos Creadoras - El marketplace de artesanias</p>
            </div>
          </div>
        `,
      });
      this.logger.log(`Email de bienvenida enviado a ${email}`);
    } catch (error) {
      this.logger.error(`Error enviando email a ${email}: ${error.message}`);
      // No lanzar error para no bloquear la creación del artesano
    }
  }

  async sendOrderCreatedBuyer(email: string, name: string, order: any, products: any[]): Promise<void> {
    if (!email) return;
    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:5173');
    const supportWhatsapp = this.config.get('SUPPORT_WHATSAPP', '573001234567');
    const total = (order.totalOrder || 0).toLocaleString('es-CO');
    const methodLabels: Record<string, string> = {
      whatsapp: 'Coordinacion por WhatsApp con el artesano',
      transfer: 'Transferencia bancaria (Bancolombia, Nequi, Daviplata)',
      cod: 'Pago contra entrega',
    };
    const methodLabel = methodLabels[order.paymentMethod] || order.paymentMethod;
    const itemsHtml = (order.items || [])
      .map((it: any, idx: number) => {
        const p = products[idx] || {};
        return `<li>${it.quantity} x ${p.title || 'Producto'} — $${(it.totalItem || 0).toLocaleString('es-CO')}</li>`;
      })
      .join('');
    try {
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM', 'noreply@manoscreadoras.com'),
        to: email,
        subject: `Recibimos tu pedido #${order._id?.toString().slice(-6)} — Manos Creadoras`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color:#C2410C;">Manos<span style="color:#1F1A17;">Creadoras</span></h1>
            <h2>Hola ${name},</h2>
            <p>Recibimos tu pedido. <strong>Total: $${total} COP</strong></p>
            <h3>Productos</h3>
            <ul>${itemsHtml}</ul>
            <h3>Metodo de pago seleccionado</h3>
            <p>${methodLabel}</p>
            <p>Veras las instrucciones detalladas en la pagina del pedido y te llegaran tambien por WhatsApp si nos das tu numero.</p>
            <a href="${frontendUrl}/pedido/${order._id}" style="background:#C2410C;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">Ver mi pedido</a>
            <p style="margin-top:20px;color:#6B6357;font-size:13px;">Si tienes dudas, escribenos por <a href="https://wa.me/${supportWhatsapp}">WhatsApp</a>.</p>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error(`Error enviando confirmacion pedido a ${email}: ${error.message}`);
    }
  }

  async notifyArtisansNewOrder(products: any[], order: any): Promise<void> {
    const seen = new Set<string>();
    for (const p of products) {
      const artisanEmail = p?.artisan?.email;
      const artisanName = p?.artisan?.name || 'artesano';
      if (!artisanEmail || seen.has(artisanEmail)) continue;
      seen.add(artisanEmail);
      try {
        await this.transporter.sendMail({
          from: this.config.get('MAIL_FROM', 'noreply@manoscreadoras.com'),
          to: artisanEmail,
          subject: `Nuevo pedido recibido — ${p.title}`,
          html: `
            <h2>Hola ${artisanName},</h2>
            <p>Tienes un nuevo pedido en Manos Creadoras.</p>
            <p><strong>Pedido #${order._id?.toString().slice(-6)}</strong></p>
            <p>Metodo de pago: <strong>${order.paymentMethod}</strong></p>
            <p>Ingresa al panel para ver detalles y coordinar el envio.</p>
          `,
        });
      } catch (error) {
        this.logger.error(`Error notificando artesano ${artisanEmail}: ${error.message}`);
      }
    }
  }

  async sendArtisanApplicationReceived(email: string, name: string): Promise<void> {
    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:5173');
    try {
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM', 'noreply@manoscreadoras.com'),
        to: email,
        subject: 'Recibimos tu solicitud — Manos Creadoras',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #C2410C;">Manos<span style="color: #1F1A17;">Creadoras</span></h1>
            <h2>Hola ${name},</h2>
            <p>Recibimos tu solicitud para vender en Manos Creadoras. Estamos revisando tu informacion y te avisaremos en menos de <strong>24 horas</strong> cuando tu cuenta este aprobada.</p>
            <p>Mientras tanto, prepara fotos de tus piezas (fondo claro, luz natural). Eso nos ayudara a publicarlas mas rapido cuando ingreses.</p>
            <p>Si tienes preguntas, escribenos a <a href="mailto:hola@manoscreadoras.com">hola@manoscreadoras.com</a>.</p>
            <p style="color: #6B6357; font-size: 12px;">Manos Creadoras — Hecho en Colombia</p>
            <a href="${frontendUrl}" style="background:#C2410C;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px;">Ir al sitio</a>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error(`Error enviando email solicitud a ${email}: ${error.message}`);
    }
  }

  async notifyAdminNewArtisanApplication(user: any): Promise<void> {
    const adminEmail = this.config.get('ADMIN_NOTIFICATIONS_EMAIL') || this.config.get('MAIL_USER');
    if (!adminEmail) return;
    try {
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM', 'noreply@manoscreadoras.com'),
        to: adminEmail,
        subject: `Nueva solicitud de artesano: ${user.name}`,
        html: `
          <h3>Nueva solicitud de artesano</h3>
          <ul>
            <li><strong>Nombre:</strong> ${user.name}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Oficio:</strong> ${user.craft || '—'}</li>
            <li><strong>Region:</strong> ${user.region || '—'}</li>
            <li><strong>WhatsApp:</strong> ${user.whatsapp || '—'}</li>
            <li><strong>Instagram:</strong> ${user.instagram || '—'}</li>
            <li><strong>Notas:</strong> ${user.applicationNotes || '—'}</li>
          </ul>
          <p>Aprueba o rechaza desde el dashboard admin.</p>
        `,
      });
    } catch (error) {
      this.logger.error(`Error notificando admin: ${error.message}`);
    }
  }

  async sendArtisanApproved(email: string, name: string): Promise<void> {
    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:5173');
    try {
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM', 'noreply@manoscreadoras.com'),
        to: email,
        subject: 'Tu cuenta de artesano fue aprobada — Manos Creadoras',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color:#C2410C;">Bienvenido, ${name}</h1>
            <p>Tu cuenta de artesano fue <strong>aprobada</strong>. Ya puedes ingresar y publicar tu primer producto.</p>
            <p><strong>Comision:</strong> 0% durante los primeros 3 meses.</p>
            <a href="${frontendUrl}/login" style="background:#C2410C;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">Ingresar al panel</a>
            <p style="margin-top:16px;">Tip: completa tu perfil con foto del taller y tu historia. Los compradores compran 3x mas a artesanos con perfil completo.</p>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error(`Error enviando aprobacion a ${email}: ${error.message}`);
    }
  }

  async sendArtisanRejected(email: string, name: string, reason?: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM', 'noreply@manoscreadoras.com'),
        to: email,
        subject: 'Sobre tu solicitud — Manos Creadoras',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Hola ${name},</h2>
            <p>Revisamos tu solicitud y por ahora no podemos aprobar tu cuenta de artesano.</p>
            ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
            <p>Puedes responder este correo si quieres conversar sobre los siguientes pasos.</p>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error(`Error enviando rechazo a ${email}: ${error.message}`);
    }
  }

  async sendPasswordReset(email: string, name: string, token: string): Promise<void> {
    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:5173');
    const resetUrl = `${frontendUrl}/restablecer-contrasena?token=${token}`;
    try {
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM', 'noreply@manoscreadoras.com'),
        to: email,
        subject: 'Manos Creadoras - Restablece tu contraseña',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #e8833a;">
              <h1 style="color: #e8833a; margin: 0;">Manos<span style="color: #333;">Creadoras</span></h1>
            </div>
            <div style="padding: 30px 0;">
              <h2 style="color: #333;">Hola ${name},</h2>
              <p style="color: #555; line-height: 1.6;">
                Recibimos una solicitud para restablecer tu contrasena. Haz click en el boton de abajo para crear una nueva.
                Este enlace expira en <strong>1 hora</strong>.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #e8833a; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  Restablecer contrasena
                </a>
              </div>
              <p style="color: #999; font-size: 13px; line-height: 1.5;">
                Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contrasena no sera modificada.
              </p>
            </div>
            <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #999; font-size: 12px;">
              <p>Manos Creadoras - El marketplace de artesanias</p>
            </div>
          </div>
        `,
      });
      this.logger.log(`Email de reset enviado a ${email}`);
    } catch (error) {
      this.logger.error(`Error enviando email de reset a ${email}: ${error.message}`);
    }
  }
}
