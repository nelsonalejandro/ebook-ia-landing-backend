import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Ip } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiAuthGuard } from '../common/guards/api-auth.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { SendEmailDto } from './dto/send-email.dto';

@Controller('api')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-email')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiAuthGuard, RateLimitGuard)
  async sendEmail(@Body() dto: SendEmailDto, @Ip() ip: string) {
    this.emailService.queueEmail(dto.email, ip);
    return { ok: true, queued: true };
  }
}
