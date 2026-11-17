import { Request } from 'express';
import { AuthenticatedUser } from './current-user.type';

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};
