
import express, { Request, Response } from "express";
import userRoutes from "./routes/routes";
import { ENV } from "./config/env";

const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

export { app };

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT || (ENV as any)?.PORT || 3000);
  app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
}
