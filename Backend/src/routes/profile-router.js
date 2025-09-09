import express from  "express"
const profileRouter=express.Router()

profileRouter.get("/", getProfile)



export default profileRouter;
