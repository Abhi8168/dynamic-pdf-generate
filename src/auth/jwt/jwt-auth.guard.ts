import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import constants from 'lib/common/constants';
import { IS_PUBLIC_KEY } from 'lib/common/decorator';
import { UserService } from 'src/user/user.service';

require('dotenv').config();

interface CustomHeaders extends Headers {
  authorization?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY,
      });

      const userData = await this.userService.getById(payload);

      if (userData?.isDeleted == true) {
        throw new UnauthorizedException({
          status: false,
          message: 'User is deleted',
        });
      }

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const { authorization } = request.headers as CustomHeaders;
    const [type, token] = (authorization || '').split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
