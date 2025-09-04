import {z} from 'zod'

export const UserSchema = z.object({
    name: z.string().trim().min(2),
    birthday: z.coerce.date(),
    id: z.string().uuid(),
    password: z.string().trim().min(5),
    role: z.string(),
    status: z.string(),
}).strict()
export type User = z.infer<typeof UserSchema>;

// Эндопинт регистрации
export const UserRegistrationRequestSchema = z.object({
    name: z.string().trim().min(2),
    birthday: z.coerce.date(),
    password: z.string().trim().min(5),
    id: z.string().uuid().optional(),
    role: z.string().optional(),
    status: z.string().optional(),
})
export type UserRegistrationRequest = z.infer<typeof UserRegistrationRequestSchema>

export const UserRegistrationResponseSchema = z.object({
    name: z.string().trim().min(2),
    id: z.string().uuid()
}).strict()
export type UserRegistrationResponse = z.infer<typeof UserRegistrationResponseSchema>

// Эндопинт авторизации
export const UserAuthorizationRequestSchema = z.object({
    id: z.string().uuid(),
    password: z.string().trim().min(5),
}).strict()
export type UserAuthorizationRequest = z.infer<typeof UserAuthorizationRequestSchema>

export const UserAuthorizationResponseSchema = z.object({
    id: z.string().uuid()
}).strict()
export type UserAuthorizationResponse = z.infer<typeof UserAuthorizationResponseSchema>


// Эндоинт получения пользоателя по айди
export const UserFindByIdRequestSchema = z.object({
    id: z.string().uuid()
}).strict()
export type UserFindByIdRequest = z.infer<typeof UserFindByIdRequestSchema>

export const UserFindByIdResponseSchema = z.object({
    name: z.string().trim().min(2),
    id: z.string().uuid()
}).strict()
export type UserFindByIdResponse = z.infer<typeof UserFindByIdResponseSchema>

// Эндопинт получения списка пользователей
export const UserResponseSchema = UserSchema.omit({ password: true });

export const UsersTableResponseSchema = z.object({
    users: z.array(UserResponseSchema)
})
export type UsersTableResponse = z.infer<typeof UsersTableResponseSchema>

//Эндопоинт блокировки

export const UserBanRequestSchema = z.object({
    id: z.string().uuid()
}).strict()
export type UserBanRequest = z.infer<typeof UserBanRequestSchema>

export const UserBanResponseSchema = z.object({
    id: z.string().uuid(),
    status: z.string()
}).strict()
export type UserBanResponse = z.infer<typeof UserBanResponseSchema>

