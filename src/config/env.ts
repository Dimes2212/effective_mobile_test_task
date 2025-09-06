import dotenv from "dotenv";
import { z } from "zod";


dotenv.config();


const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),           
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 chars long")
});


export const ENV = EnvSchema.parse(process.env);
export type EnvType = z.infer<typeof EnvSchema>;
