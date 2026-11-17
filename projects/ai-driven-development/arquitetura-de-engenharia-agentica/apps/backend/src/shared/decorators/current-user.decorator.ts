import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthenticatedRequest } from '../types/authenticated-request.type';
import { AuthenticatedUser } from '../types/current-user.type';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
