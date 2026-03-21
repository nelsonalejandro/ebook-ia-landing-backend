import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const isDev = process.env.NODE_ENV !== 'production';
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['x-api-token'];
    const validToken = process.env.API_TOKEN;

    if (isDev && !authHeader) {
      return true;
    }

    if (!authHeader || !validToken) {
      throw new UnauthorizedException('Token de API requerido');
    }

    if (authHeader !== validToken) {
      throw new UnauthorizedException('Token de API inválido');
    }

    return true;
  }
}
