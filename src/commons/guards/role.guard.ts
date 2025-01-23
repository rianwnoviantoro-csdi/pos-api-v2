import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/config/database/schemas/user.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permissionReq = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!permissionReq) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (this.hasSuperAdminRole(user) || this.hasManageAppPermission(user)) {
      return true;
    }

    return this.matchRoles(permissionReq, user);
  }

  matchRoles(permissionReq: string[], user: User): boolean {
    const userPermissions = user.roles.flatMap((role) =>
      role.permissions.map(({ name }) => name),
    );

    return permissionReq.some((requiredPermission) =>
      userPermissions.includes(requiredPermission),
    );
  }

  private hasSuperAdminRole(user: User): boolean {
    return user.roles.some((role) => role.name === 'SUPER ADMIN');
  }

  private hasManageAppPermission(user: User): boolean {
    return user.roles.some((role) =>
      role.permissions.some((permission) => permission.name === 'manage:app'),
    );
  }
}
