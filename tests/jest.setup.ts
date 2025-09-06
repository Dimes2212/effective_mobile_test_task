import * as dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
dotenv.config();

if (!process.env.JWT_SECRET) process.env.JWT_SECRET = "test_secret_please_change";
if (!process.env.NODE_ENV) process.env.NODE_ENV = "test";
