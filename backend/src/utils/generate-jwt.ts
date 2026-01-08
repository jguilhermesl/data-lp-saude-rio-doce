import { sign } from 'jsonwebtoken';

interface JwtUser { name: string | null, role: "ADMIN" | "VIEWER" | "MANAGER", id: string, email: string }

export const generateJwt = (user: JwtUser, type: "default" | "refreshToken") => {
  const token = sign(
    {
      name: user?.name,
      role: user?.role,
      email: user?.email,
    },
    '' + process.env.JWT_SECRET,
    {
      subject: user?.id,
      expiresIn: type === "default" ? '7d' : '7d',
    }
  );

  return token;
}