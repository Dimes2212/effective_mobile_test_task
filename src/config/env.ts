import dotenv from "dotenv";

dotenv.config(); // загружает переменные из .env в process.env

export const ENV = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:Alibaba228@localhost:5432/test",
  JWT_SECRET: process.env.JWT_SECRET || "changeme"
};
