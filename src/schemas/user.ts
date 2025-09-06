import { z } from "zod";

const Role = z.enum(["ADMIN", "USER"]);
const Status = z.enum(["ACTIVE", "BLOCKED"]);

export const UserSchema = z.object({
  email: z.string().email(),                 
  name: z.string().trim().min(2),
  birthday: z.coerce.date().optional(),
  password: z.string().trim().min(5),
  role: Role,
  status: Status,
}).strict();
export type User = z.infer<typeof UserSchema>;


export const UserRegistrationRequestSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(2),
  birthday: z.coerce.date().optional(),
  password: z.string().trim().min(8),
  role: Role.optional(),
  status: Status.optional(),
}).strict();
export type UserRegistrationRequest = z.infer<typeof UserRegistrationRequestSchema>;

export const UserRegistrationResponseSchema = z.object({
  email: z.string().email(),
  name: z.string(),
}).strict();
export type UserRegistrationResponse = z.infer<typeof UserRegistrationResponseSchema>;


export const UserAuthorizationRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().trim().min(8),
}).strict();
export type UserAuthorizationRequest = z.infer<typeof UserAuthorizationRequestSchema>;

export const UserAuthorizationResponseSchema = z.object({
  token: z.string(),
}).strict();
export type UserAuthorizationResponse = z.infer<typeof UserAuthorizationResponseSchema>;


export const UserFindByIdRequestSchema = z.object({
  email: z.string().email(),                  
}).strict();
export type UserFindByIdRequest = z.infer<typeof UserFindByIdRequestSchema>;

export const UserFindByIdResponseSchema = UserSchema.omit({ password: true });
export type UserFindByIdResponse = z.infer<typeof UserFindByIdResponseSchema>;


export const UserResponseSchema = UserSchema.omit({ password: true });

export const UsersTableResponseSchema = z.object({
  users: z.array(UserResponseSchema),
}).strict();
export type UsersTableResponse = z.infer<typeof UsersTableResponseSchema>;


export const UserBanRequestSchema = z.object({
  email: z.string().email(),
}).strict();
export type UserBanRequest = z.infer<typeof UserBanRequestSchema>;

export const UserBanResponseSchema = z.object({
  email: z.string().email(),
  status: Status,
}).strict();
export type UserBanResponse = z.infer<typeof UserBanResponseSchema>;
