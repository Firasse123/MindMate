import {  getPersonalizedPath } from '../controllers/path-controller.js';
import { verifyToken  } from "../middleware/VerifyToken.js";
import express from "express";
const pathRouter=express.Router();

pathRouter.get('/', verifyToken, getPersonalizedPath);

export default pathRouter;