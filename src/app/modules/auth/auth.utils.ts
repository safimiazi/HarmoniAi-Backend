import jwt, { JwtPayload } from "jsonwebtoken";

export const createToken = (
  jwtPayload: { userId: string; role: string },
  secret: string,
  expiresIn: number
) => {
  return jwt.sign(jwtPayload, secret, { expiresIn, algorithm: "HS256" });
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};
