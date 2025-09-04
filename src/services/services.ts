import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
    UserRegistrationRequest,
    User,
    UserAuthorizationRequest
  } from "../schemas/user.js";
import { da } from "zod/locales";
const JWT_SECRET = process.env.JWT_SECRET ?? "supersecret";



export async function CreateUser(data: UserRegistrationRequest) {
    try {
        const hashed = await bcrypt.hash(data.password, 10);

        const user = await prisma.user.create({
            data: {
                name: data.name,
                birthday: data.birthday,
                password: hashed,
                role: data.role ?? "USER",
                status: data.status ?? "ACTIVE"
            },
            select: {
                id: true,
                name: true,
                birthday: true,
                role: true,
                status: true,
                createdAt: true
            }
        })
        return user;
    } 
    catch {
        throw new Error("Server error")
    }
}

// export async function Auth(data: UserAuthorizationRequest) {
//     try {

//     } catch {
//         throw new Error("Sercer Error")
//     }
// }

export async function LoginById(data: {id: string, password: string}) {
    const user = await prisma.user.findUnique({where: {id: data.id}})
    if (!user) {
        throw new Error("User not found")
    }
    const isValid = await bcrypt.compare(data.password , user.password);
    if (!isValid) {
        throw new Error("Incorrect password")
    }
    const token = jwt.sign(
        { id: user.id, role: user.role }, // payload
        JWT_SECRET,                       // секретный ключ
        { expiresIn: "30m" }              // опции
    );
    return {token}
}

export async function getAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        birthday: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  export async function getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        birthday: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  export async function setStatus(id: string, status: "ACTIVE" | "BLOCKED") {
    const newStatus = status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
  
    return prisma.user.update({
      where: { id },
      data: { status: newStatus },
      select: { id: true, status: true },
    });
  }
  