import { JwtPayload } from './jwt-payload.type';

export type AuthenticatedUser = {
  id: string;
  email?: string;
  claims: JwtPayload;
};
