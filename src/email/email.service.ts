import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

interface EmailJob {
  email: string;
  ip: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private emailQueue: EmailJob[] = [];
  private isProcessing = false;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });
  }

  queueEmail(email: string, ip: string): void {
    this.emailQueue.push({ email, ip });
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.emailQueue.length === 0) return;

    this.isProcessing = true;

    while (this.emailQueue.length > 0) {
      const job = this.emailQueue.shift();
      if (!job) break;

      try {
        await this.sendEmailJob(job.email, job.ip);
      } catch (error) {
        console.error(`❌ Error en cola para ${job.email}:`, error.message);
      }

      if (this.emailQueue.length > 0) {
        await this.delay(1000);
      }
    }

    this.isProcessing = false;
  }

  private async sendEmailJob(email: string, ip: string): Promise<void> {
    const htmlBody = await this.getEmailTemplate();

    const pdfPath = path.join(process.cwd(), '..', 'public', 'assets', 'primer_capitulo_gratis.pdf');
    const pdfBuffer = fs.existsSync(pdfPath) ? fs.readFileSync(pdfPath) : null;

    const profileImgPath = path.join(process.cwd(), 'src', 'img', 'perfil.png');
    const profileImgBuffer = fs.existsSync(profileImgPath) ? fs.readFileSync(profileImgPath) : null;

    const lectoraImgPath = path.join(process.cwd(), '..', 'public', 'assets', 'lectora_nueva.png');
    const lectoraImgBuffer = fs.existsSync(lectoraImgPath) ? fs.readFileSync(lectoraImgPath) : null;

    const attachments = [];

    if (pdfBuffer) {
      attachments.push({
        filename: 'primer_capitulo_gratis.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      });
    }

    if (profileImgBuffer) {
      attachments.push({
        filename: 'perfil.png',
        content: profileImgBuffer,
        cid: 'profile-image',
      });
    }

    if (lectoraImgBuffer) {
      attachments.push({
        filename: 'lectora.png',
        content: lectoraImgBuffer,
        cid: 'lectora-image',
      });
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Nelson Ramos" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '📘 Tu primer capítulo — Prompt Engineering',
      html: htmlBody,
    };

    if (attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    await this.transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${email} desde IP: ${ip}`);
  }

  private async getEmailTemplate(): Promise<string> {
    const templatePath = path.join(process.cwd(), '..', 'email_template.html');
    let html = fs.readFileSync(templatePath, 'utf-8');
    html = html.replace(/\{\{AMAZON_LINK\}\}/g, process.env.AMAZON_LINK || '#');
    html = html.replace('{{PROFILE_IMAGE}}', 'cid:profile-image');
    html = html.replace('https://www.nelsonramos.cl/assets/lectora_nueva.png', 'cid:lectora-image');
    return html;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
