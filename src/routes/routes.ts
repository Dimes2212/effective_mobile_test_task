import {
    Registration ,
    Authorization,
    GetUserById,
    GetAllUsers,
    BanUser
} from '../controllers/controllers'
import { Router } from "express";
import { auth } from "../authorization/auth";

const router = Router();

// публичные
router.post("/register", Registration);
router.post("/login", Authorization);

// защищённые
router.get("/", auth, GetAllUsers);
router.get("/:email", auth, GetUserById);
router.patch("/:email/ban" , auth , BanUser)


export default router;