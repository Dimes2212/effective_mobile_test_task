import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

const JWT_SECRET = ENV.JWT_SECRET;

// Типизированный payload JWT-токена
interface JwtPayload {
  email: string;
  role: "ADMIN" | "USER";
  iat?: number;
  exp?: number;
}

// Расширяем Request, чтобы Express понимал свойство user
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function auth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Проверяем, что декодированный объект действительно соответствует структуре JWT payload
    if (typeof decoded === "object" && "email" in decoded && "role" in decoded) {
      req.user = decoded as JwtPayload;
      return next();
    }

    return res.status(401).json({ error: "Invalid token payload" });
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
