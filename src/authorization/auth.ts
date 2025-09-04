import { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET ?? "supersecret";


export function auth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
  
    try {
      const token = header.split(" ")[1];
      const payload = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
      (req as any).user = payload;
  
      next(); 
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  }
  