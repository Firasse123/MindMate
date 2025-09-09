import express from "express";
const FicheRouter=express.Router();
import { verifyToken  } from "../middleware/VerifyToken.js";
import {getAllFiches,getFilteredFiches,generateFiche,getFiche,deleteFiche,updateFiche,evaluateFiche,getAvailableDifficulties,getAvailableDomains} from "../controllers/fiche-controller.js" 

FicheRouter.get("/",verifyToken,getAllFiches);
FicheRouter.get("/filter",verifyToken,getFilteredFiches);
FicheRouter.post("/generate",verifyToken,generateFiche);
FicheRouter.post("/evaluate",verifyToken,evaluateFiche);
FicheRouter.put("/:id",verifyToken,updateFiche);
FicheRouter.delete("/:id",verifyToken,deleteFiche);
FicheRouter.get("/meta/domains", verifyToken, getAvailableDomains);
FicheRouter.get("/meta/difficulties", verifyToken, getAvailableDifficulties);
FicheRouter.get("/:id",verifyToken,getFiche)

export default FicheRouter;