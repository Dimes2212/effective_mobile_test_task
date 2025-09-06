import {
  UserRegistrationRequestSchema,
  UserRegistrationResponseSchema,
  UserFindByIdRequestSchema,
  UserFindByIdResponseSchema,
  UserBanRequestSchema,
  UserBanResponseSchema,
  UserAuthorizationRequestSchema,
  UserAuthorizationResponseSchema,
  UsersTableResponseSchema,
} from "../schemas/user";
import {
  CreateUser,
  LoginById,
  getAll,
  getById,
  setStatus,
} from "../services/services";
import { Request, Response } from "express";
import { ZodError } from "zod";

export const Registration = async (req: Request, res: Response) => {
  try {
    const data = UserRegistrationRequestSchema.parse(req.body);
    const ifexists = await getById(data.email);
    if (ifexists) {
      return res.status(409).json({error: "User exists"})
    }
    const user = await CreateUser(data);

    const response = UserRegistrationResponseSchema.parse(user);

    return res.status(201).json(response);
  } catch (e: any) {
    if (e.message === "Server error") {
      return res.status(500).json({ error: "Server error" });
    }9
    return res.status(400).json({ error: e.message });
  }
};

export const Authorization = async (req: Request, res: Response) => {
  try {
    const existUser = UserAuthorizationRequestSchema.parse(req.body);

    const { token } = await LoginById(existUser);
    const parsedToken = UserAuthorizationResponseSchema.parse({ token });
    return res.status(200).json(parsedToken);
  } catch (e: any) {
    if (e instanceof ZodError) {
      return res.status(400).json({ error: e.errors });
    }
    return res.status(401).json({ error: e.message });
  }
};

export const GetUserById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { email } = UserFindByIdRequestSchema.parse(req.params);

    const neededUser = await getById(email);
    if (!neededUser) {
      return res.status(404).json({ error: "User not found" }); 
    }

    if (req.user.role !== "ADMIN" && req.user.email !== email) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const response = UserFindByIdResponseSchema.parse(neededUser);
    return res.status(200).json(response);
  } catch (e: any) {
    if (e instanceof ZodError) {
      return res.status(400).json({ error: e.errors }); 
    }
    return res.status(401).json({ error: e.message });
  }
};


export const GetAllUsers = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.user.role === "ADMIN") {
      const allUsers = await getAll();

      const response = UsersTableResponseSchema.parse({ users: allUsers });

      return res.json(response);
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }
  } catch (e: any) {
    return res.status(401).json({ error: e.message });
  }
};

export const BanUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { email } = UserBanRequestSchema.parse(req.params);

    if (req.user.role !== "ADMIN" && req.user.email !== email) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const neededUser = await getById(email);
    if (!neededUser) {
      throw new Error("User not found");
    }

    const answer = await setStatus(neededUser.email, neededUser.status);
    const parsedStatus = UserBanResponseSchema.parse(answer);
    return res.status(200).json(parsedStatus);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
};
