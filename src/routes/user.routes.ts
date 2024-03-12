import express from "express"
import { changeUserRole, deleteUser, getAllUsers, getUser, newUser } from "../controllers/user.js"
import { adminOnly } from "../middleware/auth.js"
// import {Router} from "express"
// const router = Router()
const userRouter = express.Router()

// router.route("/login").post(loginUser)

userRouter.post("/new",newUser)
userRouter.get("/allUsers",adminOnly,getAllUsers)
userRouter.get("/userDetails/:id",getUser)
userRouter.put("/changeUserRole/:id",adminOnly,changeUserRole)
userRouter.delete("/deleteUser/:id",adminOnly,deleteUser)

export default userRouter

 
