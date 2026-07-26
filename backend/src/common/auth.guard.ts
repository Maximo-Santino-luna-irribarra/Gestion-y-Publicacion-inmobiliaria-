import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.headers.authorization?.replace(/^Bearer /, '');
    if (!token) throw new UnauthorizedException('Iniciá sesión para continuar');
    try {
      (req as Request & { user: unknown }).user =
        await this.jwt.verifyAsync(token);
      return true;
    } catch {
      throw new UnauthorizedException('La sesión venció o no es válida');
    }
  }
}
