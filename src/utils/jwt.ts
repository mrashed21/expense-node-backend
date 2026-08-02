import { IJwtPayload } from "@/modules/user/user.interface";
import jwt, { Secret } from "jsonwebtoken";

export const generateToken = (
  payload: IJwtPayload,
  secret: Secret,
  expiresIn: string,
): string => {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string, secret: Secret): IJwtPayload => {
  return jwt.verify(token, secret) as IJwtPayload;
};
