import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private static ipCache: Map<string, RateLimitEntry> = new Map();

  private readonly windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
  private readonly maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '3', 10);

  constructor() {
    setInterval(() => this.cleanup(), this.windowMs);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip || (request.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown';
    const now = Date.now();

    let entry = RateLimitGuard.ipCache.get(ip);

    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + this.windowMs };
      RateLimitGuard.ipCache.set(ip, entry);
    }

    entry.count++;

    if (entry.count > this.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      throw new HttpException(
        `Demasiadas solicitudes. Intenta de nuevo en ${retryAfter} segundos.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [ip, entry] of RateLimitGuard.ipCache.entries()) {
      if (now > entry.resetTime) {
        RateLimitGuard.ipCache.delete(ip);
      }
    }
  }
}
