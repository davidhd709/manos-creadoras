import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    // SuperAdmin NO tiene bypass automático: solo accede a endpoints donde
    // está listado explícitamente en @Roles(...). Esto evita que el rol
    // global pueda actuar como buyer o artesano y opere recursos privados.
    return requiredRoles.includes(user?.role);
  }
}
