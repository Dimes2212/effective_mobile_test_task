import { Request, Response, NextFunction } from "express";

export function toErrorResponse(e: unknown): { error: string } {
  if (e instanceof Error) return { error: e.message };
  if (typeof e === "string") return { error: e };
  return { error: "Unexpected error" };
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const { error } = toErrorResponse(err);
  res.status(500).json({ error });
}