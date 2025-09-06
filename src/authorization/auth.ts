import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
const JWT_SECRET = ENV.JWT_SECRET;


export function auth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
  
    try {
      const token = header.split(" ")[1];
      const payload = jwt.verify(token, JWT_SECRET) as { email: string; role: string };
      (req as any).user = payload;
  
      next(); 
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  }
  