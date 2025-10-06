import prisma from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  UserRegistrationRequest,
  UserAuthorizationRequest,
} from "../schemas/user";
import { Status } from "../../generated/prisma/index";
import { ENV } from "../config/env";

const JWT_SECRET = ENV.JWT_SECRET;


export async function CreateUser(data: UserRegistrationRequest) {
  try {
    const hashed = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        ...(data.birthday ? { birthday: new Date(data.birthday) } : {}),
        password: hashed,
        role: data.role ?? "USER",
        status: data.status ?? Status.ACTIVE,
      },
      select: {
        email: true,
        name: true,
      },
    });

    return user;
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error("CreateUser error:", e.message);
      throw e;
    }
    console.error("CreateUser unknown error:", e);
    throw new Error("Unexpected error"); 
  }
}


export async function LoginById(data: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new Error("User not found");
  }

  const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) {
    throw new Error("Incorrect password");
  }

  const token = jwt.sign(
    { email: user.email, role: user.role }, 
    JWT_SECRET,
    { expiresIn: "30m" }
  );
  return { token };
}


export async function getAll() {
  return prisma.user.findMany({
    select: {
      email: true,
      name: true,
      birthday: true,
      role: true,
      status: true,
    },
  });
}


export async function getById(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      email: true,
      name: true,
      birthday: true,
      role: true,
      status: true,
    },
  });
}


export async function setStatus(email: string, status: Status) {
  const newStatus = status === Status.ACTIVE ? Status.BLOCKED : Status.ACTIVE;

  return prisma.user.update({
    where: { email },
    data: { status: newStatus },
    select: { email: true, status: true },
  });
}
