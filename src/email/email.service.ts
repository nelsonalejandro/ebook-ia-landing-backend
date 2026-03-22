import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

interface EmailJob {
  email: string;
  ip: string;
  amazonLink: string;
  price?: number;
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

  queueEmail(email: string, ip: string, amazonLink: string, price?: number): void {
    this.emailQueue.push({ email, ip, amazonLink, price });
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
        await this.sendEmailJob(job.email, job.ip, job.amazonLink, job.price);
      } catch (error) {
        console.error(`❌ Error en cola para ${job.email}:`, error.message);
      }

      if (this.emailQueue.length > 0) {
        await this.delay(1000);
      }
    }

    this.isProcessing = false;
  }

  private async sendEmailJob(email: string, ip: string, amazonLink: string, price?: number): Promise<void> {
    console.log('📧 Iniciando envío a:', email);
    console.log('📧 CWD:', process.cwd());
    
    const templatePath = path.join(__dirname, 'email_template.html');
    console.log('📧 Template path:', templatePath);
    console.log('📧 Template existe:', fs.existsSync(templatePath));

    const htmlBody = await this.getEmailTemplate(amazonLink, price);
    console.log('📧 HTML body length:', htmlBody.length);

    const pdfPath = path.join(__dirname, '..', 'public', 'assets', 'primer_capitulo_gratis.pdf');
    const pdfBuffer = fs.existsSync(pdfPath) ? fs.readFileSync(pdfPath) : null;
    console.log('📧 PDF existe:', fs.existsSync(pdfPath));

    const profileImgPath = path.join(__dirname, '..', 'img', 'perfil.png');
    const profileImgBuffer = fs.existsSync(profileImgPath) ? fs.readFileSync(profileImgPath) : null;

    const lectoraImgPath = path.join(__dirname, '..', 'img', 'lectora_nueva.png');
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

    console.log('📧 Attachments:', attachments.length);

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Nelson Ramos" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '📘 Tu primer capítulo — Prompt Engineering',
      html: htmlBody,
    };

    if (attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    console.log('📧 Enviando email...');
    await this.transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${email} desde IP: ${ip}`);
  }

  private async getEmailTemplate(amazonLink: string, price?: number): Promise<string> {
    const templatePath = path.join(__dirname, 'email_template.html');
    let html = fs.readFileSync(templatePath, 'utf-8');
    html = html.replace(/\{\{AMAZON_LINK\}\}/g, amazonLink || '#');
    html = html.replace(/\{\{PRICE\}\}/g, price ? `$${price} USD` : '$9.99 USD');
    html = html.replace('{{PROFILE_IMAGE}}', 'cid:profile-image');
    html = html.replace('https://www.nelsonramos.cl/assets/lectora_nueva.png', 'cid:lectora-image');
    return html;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
