import express from "express";
import {getAllUsers,userLogin,userRegister} from "../controllers/user-controller.js";
const userRouter=express.Router();
import {validate,signupValidator,loginValidator} from "../utils/validators.js";
userRouter.get("/", getAllUsers);
userRouter.post("/login", validate(loginValidator), userLogin);
userRouter.post("/register", validate(signupValidator), userRegister);

export default userRouter;