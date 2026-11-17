import { AuthenticatedUser } from '../types/current-user.type';
import { JwtPayload } from '../types/jwt-payload.type';

export function mapJwtPayloadToAuthenticatedUser(
  payload: JwtPayload,
): AuthenticatedUser {
  return {
    id: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    claims: payload,
  };
}
