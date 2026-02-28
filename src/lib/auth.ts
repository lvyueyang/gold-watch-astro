import { jwtVerify, SignJWT } from "jose";

export const JWT_SECRET_DEFAULT = "dev-secret-please-change-in-prod-1234567890";

export async function signToken(payload: any, secret: string) {
  const secretKey = new TextEncoder().encode(secret || JWT_SECRET_DEFAULT);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyToken(token: string, secret: string) {
  const secretKey = new TextEncoder().encode(secret || JWT_SECRET_DEFAULT);
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
}
