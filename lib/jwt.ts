import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;
const EXPIRES = "7d";

export interface JWTPayload {
  userId: string;
  role: "buyer" | "seller" | "admin";
  phone?: string;
  email?: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload | null {
  try { return jwt.verify(token, SECRET) as JWTPayload; }
  catch { return null; }
}
