import { User , 
    UserRegistrationRequest, 
    UserRegistrationResponse , 
    UserFindByIdRequest , 
    UserFindByIdResponse , 
    UserBanRequest, 
    UserBanResponse,
    UserSchema , 
    UserRegistrationRequestSchema, 
    UserRegistrationResponseSchema , 
    UserFindByIdRequestSchema , 
    UserFindByIdResponseSchema, 
    UserBanRequestSchema, 
    UserBanResponseSchema,
    UserAuthorizationRequestSchema,
    UsersTableResponseSchema} from '../schemas/user.js';
import { CreateUser , LoginById , getAll, getById, setStatus } from '../services/services.js';
import { Request, Response } from "express";


export const Registration = async (req: Request, res: Response) => {
    try {
      const data = UserRegistrationRequestSchema.parse(req.body);
      const user = await CreateUser(data);

      
      const response = UserRegistrationResponseSchema.parse(user);

      return res.status(201).json(response);
    } catch (e: any) {
      if (e.message === "Server error") {
        return res.status(500).json({ error: "Server error" });
      }
      return res.status(400).json({ error: e.message });
    }
};


export const Authorization = async (req: Request , res: Response) => {
    try{ 
        const existUser = UserAuthorizationRequestSchema.parse(req.body);

        const {token} = await LoginById(existUser);
        return res.json({token})
    } catch (e: any) {
        return res.status(401).json({ error: e.message });
    }
}

export const GetUserById = async (req: Request, res: Response) => {
    try{ 
        const { id } = UserFindByIdRequestSchema.parse(req.params)
        if(req.user.role === "ADMIN") {
            const neededUser = await getById(id)
            const response = UserFindByIdResponseSchema.parse(neededUser);
            return res.json(response)
        } else {
            if(req.user.id !== id) {
                throw new Error("You have no rights")
            }
            const neededUser = await getById(id)
            const response = UserFindByIdResponseSchema.parse(neededUser);
            return res.json(response)
        }
    } catch (e: any) {
        return res.status(401).json({ error: e.message });
    }
}


// export const GetAllUsers = async (req: Request , res: Response) => {
//     try{
//         if(req.user.role === "ADMIN") {
//             const allUsers =  await getAll();
//             return res.json(allUsers)
//         } else {
//             throw new Error("You have no rights")
//         }
//     } catch (e: any) {
//         return res.status(401).json({ error: e.message });
//     }
// }

export const GetAllUsers = async (req: Request , res: Response) => {
    try{
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
          }

        if(req.user.role === "ADMIN") {
            const allUsers = await getAll();

            const response = UsersTableResponseSchema.parse({ users: allUsers });

            return res.json(response);
        } else {
            throw new Error("You have no rights")
        }
    } catch (e: any) {
        return res.status(401).json({ error: e.message });
    }
}

export const BanUser = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
          }

        if (req.user.role !== "ADMIN" && req.user.id !== req.body.id) {
            throw new Error("You have no rights")
        
        } else if((req.user.role === "ADMIN") || (req.user.role !== "ADMIN" && req.user.id === req.body.id)) {
            const neededUser = await getById(req.body.id);
            const answer = setStatus(neededUser.id , neededUser.status);
            const parsedStatus = UserBanResponseSchema.parse(answer)
            return res.status(200).json({parsedStatus})
        } 

    } catch (e: any) {
        return res.status(401).json({ error: e.message });
    }
}  
