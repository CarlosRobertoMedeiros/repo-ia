export type JwtPayload = {
  sub: string;
  email?: string;
  [key: string]: unknown;
};
