import express from "express";
import {getAllUsers,userLogin,userRegister} from "../controllers/user-controller.js";
const userRouter=express.Router();

userRouter.get("/", getAllUsers);
userRouter.post("/login", userLogin);
userRouter.post("/register", userRegister);

export default userRouter;