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
}
